// ------------ Packages ----------- //

const { src, dest, watch, series, parallel } = require("gulp");
const sass = require("gulp-dart-sass");
const autoprefixer = require("gulp-autoprefixer");
const csso = require("gulp-csso");
const babel = require("gulp-babel");
const rename = require("gulp-rename");
const terser = require("gulp-terser");
const webpack = require("webpack-stream");
const sourcemaps = require("gulp-sourcemaps");
const del = require("del");
const mode = require("gulp-mode")();
const browserSync = require("browser-sync").create();

// ----------- Files Paths Object ----------- //

files = {
  css: {
    src: "./app/src/scss/main.scss",
    dist: "./app/dist/css",
    all: "./app/src/scss/**/*.scss",
  },

  js: {
    src: "./app/src/js/index.js",
    dist: "./app/dist/js",
    all: "./app/src/js/**/*.js",
  },

  images: {
    src: "./app/src/assets/images",
    dist: "./app/dist/assets/images",
    extentions: "./app/src/assets/images/**/*.{jpg,jpeg,png,gif,svg}",
  },
  fonts: {
    src: "./app/src/assets/fonts",
    dist: "./app/dist/assets/fonts",
    extentions: "./app/src/assets/fonts/**/*.{svg,eot,ttf,woff,woff2}",
  },
};

// -----------  Tasks   -------------//

// --------- Clean Tasks -------------
const clean = () => {
  return del(["./app/dist"]);
};

const cleanImages = () => {
  return del([files.images.dist]);
};

const cleanFonts = () => {
  return del([files.fonts.dist]);
};

// --------- SASS to CSS Task ------------
const css = () => {
  return src(files.css.src)
    .pipe(mode.development(sourcemaps.init()))
    .pipe(sass().on("error", sass.logError))
    .pipe(autoprefixer())
    .pipe(rename("app.css"))
    .pipe(mode.production(csso))
    .pipe(mode.development(sourcemaps.write()))
    .pipe(dest(files.css.dist))
    .pipe(mode.development(browserSync.stream()));
};

// Bundle JS files Task
const js = () => {
  return src(files.js.src)
    .pipe(
      babel({
        presets: ["@babel/env"],
      })
    )
    .pipe(
      webpack({
        mode: "development",
        devtool: "#@inline-source-map",
      })
    )
    .pipe(mode.development(sourcemaps.init({ loadMaps: true })))
    .pipe(rename("app.js"))
    .pipe(mode.production(terser({ output: { comments: false } })))
    .pipe(mode.development(sourcemaps.write()))
    .pipe(dest(files.js.dist))
    .pipe(mode.development(browserSync.stream()));
};

// Copy Tasks
const copyImages = () => {
  return src(files.images.extentions).pipe(dest(files.images.dist));
};

const copyFonts = () => {
  return src(files.fonts.extentions).pipe(dest(files.fonts.dist));
};

// Watch files Task
const watchForChanges = () => {
  browserSync.init({
    server: {
      baseDir: "./",
    },
  });

  watch(files.css.all, css);

  watch(files.js.all, js);

  watch("**/*.html").on("change", browserSync.reload);

  watch(files.images.extentions, series(cleanImages, copyImages));

  watch(files.fonts.extentions, series(cleanFonts, copyFonts));
};

// Public (Default) Task
exports.default = series(
  clean,
  parallel(css, js, copyImages, copyFonts),
  watchForChanges
);

exports.build = series(clean, parallel(css, js, copyImages, copyFonts));
