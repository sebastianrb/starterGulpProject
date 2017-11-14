"use strict";

var gulp = require("gulp");
var sourcemaps = require("gulp-sourcemaps");
var jshint = require("gulp-jshint");
var uglify = require("gulp-uglify");
var sass = require("gulp-sass");
var cssmin = require("gulp-cssmin");
var csslint = require("gulp-csslint");
var imagemin = require("gulp-imagemin");
var concat = require("gulp-concat");
var rename = require("gulp-rename");
var del = require("del");
var runSequence = require("run-sequence");
var watch = require("gulp-watch");
var browserSync = require("browser-sync").create();
var autoprefixer = require("gulp-autoprefixer");
var inject = require("gulp-inject");
var inlineImagePath = require("gulp-inline-image-path");

// browsersync
// Static server
gulp.task("browser-sync", function() {
    browserSync.init({
        server: {
            baseDir: "./dest/"
        }
    });
});

//clean
gulp.task("clean", function() {
    return del(["./dest", "./styles/css/main.css"]);
});

//lint and uglify js
gulp.task("scripts", function() {
    return gulp
        .src(["./js/*.js"])
        .pipe(concat("main.js"))
        .pipe(jshint())
        .pipe(
            jshint.reporter("default", {
                fail: false
            })
        )
        .pipe(uglify())
        .pipe(rename({ suffix: ".min" }))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest("./dest/scripts/"));
    // .pipe(browserSync.stream());
});

//compile sass
gulp.task("sass", function() {
    return gulp
        .src("./styles/scss/main.scss")
        .pipe(sourcemaps.init())
        .pipe(sass().on("error", sass.logError))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest("./styles/css/"));
});

// get compiled css file, lint it, and minify it
gulp.task("styles", ["sass"], function() {
    return gulp
        .src("./styles/css/*.css")
        .pipe(csslint())
        .pipe(
            autoprefixer({
                browsers: ["last 3 versions"],
                cascade: false
            })
        )
        .pipe(cssmin())
        .pipe(rename({ suffix: ".min" }))
        .pipe(gulp.dest("./dest/styles/"))
        .pipe(browserSync.reload({ stream: true }));
});

//copy html and add references
gulp.task("html", function() {
    var sources = gulp.src(["./scripts/main.min.js", "./styles/main.min.css"], {
        read: false,
        cwd: __dirname + "/dest"
    });

    var options = {
        addRootSlash: false
    };

    gulp
        .src("./*.html")
        .pipe(inject(sources, options))
        .pipe(inlineImagePath({ path: "./images" }))
        .pipe(gulp.dest("./dest"));
});

//minify images
gulp.task("images", () =>
    gulp.src("./images/*").pipe(imagemin()).pipe(gulp.dest("./dest/images")).pipe(browserSync.reload({ stream: true }))
);

//watch files for changes
gulp.task("watch", function() {
    gulp.watch("./js/*.js", ["scripts"]);
    gulp.watch("./*.html", ["html"]);
    gulp.watch("styles/scss/*.scss", ["styles"]);
    gulp.watch("./images/*", ["images"]);
    gulp.watch("./js/*.js").on("change", browserSync.reload);
    // gulp.watch("./styles/scss/*.scss").on('change', browserSync.reload);
    gulp.watch("./*.html").on("change", browserSync.reload);
    // gulp.watch("./images/*").on('change', browserSync.reload);
});

//put whole thing together in build task; be sure to run sequence

gulp.task("build", function() {
    runSequence("clean", ["scripts", "styles"], ["images"], ["html"], ["browser-sync"], ["watch"]);
});
