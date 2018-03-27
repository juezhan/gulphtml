import gulp from 'gulp'
import stylus from 'gulp-stylus'
import cleanCSS from 'gulp-clean-css'
import cssver from 'gulp-make-css-url-version'
import spritesmith from 'gulp.spritesmith'
import imagemin from 'gulp-imagemin'
import buffer from 'vinyl-buffer'
import merge from 'merge-stream'

let buildBasePath = 'build/'    //构建输出的目录
let distBasePath = 'dist/'      //构建输出的目录

gulp.task('sprite', function () {
  // Generate our spritesheet
  let spriteData = gulp.src('src/imgs/icon/*.png')
    .pipe(spritesmith({
      imgName: 'sprite.png',
      cssName: 'sprite.css'
    }))

  // Pipe image stream through image optimizer and onto disk
  let imgStream = spriteData.img
  // DEV: We must buffer our stream into a Buffer for `imagemin`
    .pipe(buffer())
    .pipe(imagemin())
    .pipe(gulp.dest('path/to/image/folder/'))

  // Pipe CSS stream through CSS optimizer and onto disk
  let cssStream = spriteData.css
    .pipe(cleanCSS({
      format: {
        breaks: {
          afterRuleEnds: true
        }
      }
    }))
    .pipe(gulp.dest('path/to/css/folder/'));

  // Return a merged stream to handle both `end` events
  return merge(imgStream, cssStream);
});

//雪碧图
// gulp.task('sprite', function () {
//   gulp.src('src/imgs/icon/*.png')
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
  return gulp.src('./src/stylus/*.styl')
    .pipe(stylus())          // stylus 转 CSS
    .pipe(cssver())          // url 增加版本号
    .pipe(cleanCSS({
      format: {
        breaks: {
          afterRuleEnds: true
        }
      }
    }))   // 格式化 CSS
    .pipe(gulp.dest(buildBasePath + '/css'));//输出到css目录
});

// 压缩图片
gulp.task('imgMin', () => {
  return gulp.src('./src/imgs/*.*')
    .pipe(imagemin())
    .pipe(gulp.dest(buildBasePath + '/imgs'))
});

gulp.task('default', ['createCss', 'imgMin'])