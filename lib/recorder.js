'use strict';

const fs = require('fs');
const rimraf = require('rimraf');
const mkdirp = require('mkdirp');

const baseRecordingsPath = 'recordings';
const isRecordingEnabled = process.env.RECORD_TESTS === 'true';

let instance;

/**
 * Records UI tests as a series of screenshots.
 */
class Recorder {
	static get instance () {
		return instance;
	}

	/**
	 * Starts recording. This should be called before each test suite.
	 *
	 * @param remote The Leadfoot object.
	 */
	beginRecording (remote) {
		this.remote = remote;

		if (isRecordingEnabled) {
			const recorder = this;

			// Override the Leadfoot session's internal _post function to intercept requests
			const session = remote._session;
			const oldPost = session._post;
			session._post = function (path) {
				let promise = oldPost.apply(this, arguments);

				// Take a screenshot every time Leadfoot is given a "click" (simulating a mouse click) or "value" (simulating text input) request
				if (path.match(/\/(?:click|value)$/)) {
					promise = promise.then(() => recorder.takeScreenshot());
				}

				return promise;
			};
		}
	}

	/**
	 * Takes a screenshot if it is different from the previous screenshot.
	 *
	 * @returns {Promise}
	 */
	takeScreenshot () {
		return this.remote.takeScreenshot().then(screenshot => {
			// Only save a screenshot if it is different from the previous screenshot
			if (!this.previousScreenshot || !screenshot.equals(this.previousScreenshot)) {
				fs.writeFile(`${this.recordingPath}/screenshot${Date.now()}.png`, screenshot);
				this.previousScreenshot = screenshot;
			}
		})
	}

	/**
	 * Called by Intern when the overall test run starts.
	 */
	runStart () {
		instance = this;
	}

	/**
	 * Called by Intern when a single test starts.
	 *
	 * @param test Information about the test that is running.
	 */
	testStart (test) {
		if (isRecordingEnabled) {
			let testPath = test.name;
			for (let currentSuite = test.parent; currentSuite && currentSuite.name; currentSuite = currentSuite.parent) {
				testPath = `${currentSuite.name}/${testPath}`;
			}

			this.recordingPath = `${baseRecordingsPath}/${testPath}`;
			recreateDirectory(this.recordingPath);
		}
	}
}

/**
 * Deletes and recreates a directory.
 *
 * @param path The path to the directory to recreate.
 */
function recreateDirectory (path) {
	rimraf.sync(path);
	mkdirp.sync(path);
}

module.exports = Recorder;
