'use strict';

import * as gulp from 'gulp';
import * as ts from 'gulp-typescript';
// import sourcemaps from 'gulp-sourcemaps';

const tsProject = ts.createProject('./src/tsconfig.json');

gulp.task('default', function () {
  return tsProject.src().pipe(tsProject()).js.pipe(gulp.dest('./dest'));
});
