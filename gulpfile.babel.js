import gulp from 'gulp'
import stylus from 'gulp-stylus'
import cleanCSS from 'gulp-clean-css'
import cssver from 'gulp-make-css-url-version'
import spritesmith from 'gulp.spritesmith'
import imagemin from 'gulp-imagemin'
import buffer from 'vinyl-buffer'
import merge from 'merge-stream'
import rev from 'gulp-rev'
import revCollector from 'gulp-rev-collector'
import fileInclude from 'gulp-file-include'
import replace from 'gulp-replace'
import concat from 'gulp-concat'
import autoprefixer from 'gulp-autoprefixer'

let projectName = '九维智库'
let buildBasePath = 'build/'    //构建输出的目录
let distPath = './dist/' + projectName
let cssPath = distPath + '/css'      //构建输出的目录
let htmlPath = distPath + '/html'      //构建输出的目录
let jsPath = distPath + '/js'      //构建输出的目录
let imgsPath = distPath + '/imgs'      //构建输出的目录

gulp.task('sprite', function () {
  // Generate our spritesheet
  let spriteData = gulp.src('./src/' + projectName + '/imgs/icon/*.png')
    .pipe(spritesmith({
      imgName: 'icon.png',
      cssName: 'icon.css'
    }))

  // Pipe image stream through image optimizer and onto disk
  let imgStream = spriteData.img
  // DEV: We must buffer our stream into a Buffer for `imagemin`
    .pipe(buffer())
    .pipe(imagemin())
    .pipe(gulp.dest(cssPath))

  // Pipe CSS stream through CSS optimizer and onto disk
  let cssStream = spriteData.css
    .pipe(cleanCSS({
      format: {
        breaks: {
          afterRuleEnds: true
        }
      }
    }))
    .pipe(gulp.dest(cssPath));

  // Return a merged stream to handle both `end` events
  return merge(imgStream, cssStream);
});

//雪碧图
// gulp.task('sprite', function () {
//   gulp.src('src/'+projectName+'/imgs/icon/*.png')
//     .pipe(spritesmith({
//       imgName: 'sprite.png',
//       cssName: 'build/css/index.css',
//       padding: 5,
//       algorithm: 'binary-tree'
//     }))
//     .pipe(gulp.dest('123/')) //输出目录
// })

// 生成 CSS
gulp.task('createCss', () => {
  return gulp.src('./src/' + projectName + '/stylus/*.styl')
    .pipe(stylus())          // stylus 转 CSS
    .pipe(autoprefixer({
      browsers: ['last 2 versions', 'Android >= 4.0'],
      cascade: true, //是否美化属性值 默认：true 像这样：
      remove: true //是否去掉不必要的前缀 默认：true
    }))
    // .pipe(concat('main.css'))
    .pipe(cssver())          // url 增加版本号
    .pipe(cleanCSS({
      format: {
        breaks: {
          afterRuleEnds: true
        }
      }
    }))   // 格式化 CSS
    .pipe(rev())
    .pipe(gulp.dest(cssPath))//输出到css目录
    .pipe(rev.manifest('rev-css-manifest.json'))
    .pipe(gulp.dest('rev'));
});

// 压缩图片
gulp.task('imgMin', () => {
  return gulp.src('./src/' + projectName + '/imgs/*.*')
    .pipe(imagemin())
    .pipe(gulp.dest(imgsPath))
});

// 生成 html
gulp.task('rev', ['createCss'], function () {
  gulp.src(['./rev/*.json', './src/' + projectName + '/html/*.html'])   //- 读取 rev-manifest.json 文件以及需要进行css名替换的文件
    .pipe(fileInclude({
      prefix: '@@',
      basepath: '@file'
    }))           //- 引入包含文件
    .pipe(revCollector())                           //- 执行文件内css名的替换
    .pipe(replace('.png', '.png?v=000'))
    .pipe(gulp.dest(htmlPath));                     //- 替换后的文件输出的目录
});

// Include HTML
gulp.task('fileinclude', function () {
  gulp.src(['./src/' + projectName + '/html/*.html'])
    .pipe(fileInclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(gulp.dest('./dist'));
});

// 拷贝 lib 文件夹
gulp.task('copylib', function () {
  return gulp.src(['lib/**/*'])
    .pipe(gulp.dest(distPath))
});

gulp.task('templates', function () {
  gulp.src(['file.txt'])
    .pipe(replace(/jpg(.{1})/g, '$1?v=123'))
    .pipe(gulp.dest('build/'));
});

gulp.task('default', ['copylib', 'rev', 'imgMin']);