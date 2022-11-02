"use strict";

import gulp from "gulp";
import ts from "gulp-typescript";
import sourcemaps from "gulp-sourcemaps";

const tsProject = ts.createProject("tsconfig.json");

gulp.task("default", function () {
  return tsProject
    .src()
    .pipe(sourcemaps.init())
    .pipe(tsProject())
    .js.pipe(gulp.dest("./dist"));
});
