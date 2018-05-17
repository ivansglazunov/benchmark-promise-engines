const fs = require('fs');
const async = require('async');
const _ = require('lodash');
const Benchmark = require('benchmark');
const beauty = require('beautify-benchmark');

const NpmPromise = require('promise');
const NpmBluebirdPromise = require("bluebird");
const RSVP = require('rsvp');
const Q = require('q');

const benchmarks = {
  sync: {
    'callback': () => {
      const method = (callback) => callback();
      return {
        fn() {
          method(() => {});
        },
      };
    },
    'build-in': () => {
      return {
        fn(defer) {
          new Promise((resolve) => resolve())
          .then(() => defer.resolve());
        },
        defer: true,
      };
    },
    'npm promise': () => {
      return {
        fn(defer) {
          new NpmPromise((resolve) => resolve())
          .then(() => defer.resolve());
        },
        defer: true,
      };
    },
    'npm bluebird': () => {
      return {
        fn(defer) {
          new NpmBluebirdPromise((resolve) => resolve())
          .then(() => defer.resolve());
        },
        defer: true,
      };
    },
    'npm rsvp': () => {
      return {
        fn(defer) {
          new RSVP.Promise((resolve) => resolve())
          .then(() => defer.resolve());
        },
        defer: true,
      };
    },
    'npm q': () => {
      return {
        fn(defer) {
          let i = false;
          const d = Q.defer();
          d.resolve();
          d.promise.then(() => {});
        },
      };
    },
  },
  async: {
    'callback': () => {
      const method = (callback) => setTimeout(callback, 0);
      return {
        fn(defer) {
          method(() => defer.resolve());
        },
        defer: true,
      };
    },
    'build-in': () => {
      return {
        fn(defer) {
          new Promise((resolve) => setTimeout(resolve, 0))
          .then(() => defer.resolve());
        },
        defer: true,
      };
    },
    'npm promise': () => {
      return {
        fn(defer) {
          new NpmPromise((resolve) => setTimeout(resolve, 0))
          .then(() => defer.resolve());
        },
        defer: true,
      };
    },
    'npm bluebird': () => {
      return {
        fn(defer) {
          new NpmBluebirdPromise((resolve) => setTimeout(resolve, 0))
          .then(() => defer.resolve());
        },
        defer: true,
      };
    },
    'npm rsvp': () => {
      return {
        fn(defer) {
          new RSVP.Promise((resolve) => setTimeout(resolve, 0))
          .then(() => defer.resolve());
        },
        defer: true,
      };
    },
    'npm q': () => {
      return {
        fn(defer) {
          const d = Q.defer();
          setTimeout(d.resolve, 0);
          d.promise.then(() => defer.resolve());
        },
        defer: true,
      };
    },
  },
}

const createSuite = (benchmarks) => {
  const suite = new Benchmark.Suite();
  for (let t in benchmarks) suite.add(t, benchmarks[t]());
  return suite;
};

const createSuites = (benchmarks) => {
  const suites = {};
  for (let n in benchmarks) suites[n] = createSuite(benchmarks[n]);
  return suites;
};

const suites = createSuites(benchmarks);

const launch = (suites) => {
  async.eachSeries(
    _.keys(suites),
    (suiteName, next) => {
      console.log(suiteName);
      suites[suiteName].on('cycle', (event) => beauty.add(event.target));
      suites[suiteName].on('complete', (event) => {
        beauty.log();
        next();
      });
      suites[suiteName].run({ async: true });
    },
  );
};

module.exports = {
  benchmarks,
  createSuite,
  createSuites,
  suites,
  launch,
};
