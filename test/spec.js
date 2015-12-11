/* global describe, it, expect, beforEach */

var chai = require('chai');
var expect = require('chai').expect;
var mocha = require('mocha');
var proxyquire = require('proxyquire');
var sinon = require('sinon');
var chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

describe('bower-git', function() {
    var module;

    it('should throw if path is not supplied', function() {
        // align
        module = require('../lib');

        // act
        expect(function() {
            module();
        }).to.throw('ABORTING: No path provided!');

        // assert
    });

    it('should throw if path does not exist', function() {
        // align
        module = proxyquire('../lib', {
            fs: {
                existsSync: function() {
                    return false;
                }
            }
        });

        // act
        expect(function() {
            module({
                path: 'hejsan'
            });
        }).to.throw('ABORTING: Folder "hejsan" does not exist');

        // assert
    });

    it('should throw if bower.json does not exist in path', function() {
        // align
        var existsSyncStub = sinon.stub();
        existsSyncStub.onCall(0).returns(true);
        existsSyncStub.returns(false);

        module = proxyquire('../lib', {
            fs: {
                existsSync: existsSyncStub
            }
        });

        // act
        expect(function() {
            module({
                path: 'hejsan'
            });
        }).to.throw('ABORTING: No bower.json found in hejsan');

        // assert
    });

    it('should throw if bower.json does contain repository information', function() {
        // align
        var existsSyncStub = sinon.stub();
        existsSyncStub.returns(true);

        module = proxyquire('../lib', {
            fs: {
                existsSync: existsSyncStub,
                readFile: function(path, callback) {
                    var err;
                    var data = {

                    };
                    callback(err, JSON.stringify(data));
                }
            }
        });

        // act
        expect(function() {
            module({
                path: 'hejsan'
            });
        }).to.throw('ABORTING: No repository information found in bower.json');

        // assert
    });

    it('should throw if bower.json does contain repository url information', function() {
        // align
        var existsSyncStub = sinon.stub();
        existsSyncStub.returns(true);

        module = proxyquire('../lib', {
            fs: {
                existsSync: existsSyncStub,
                readFile: function(path, callback) {
                    var err;
                    var data = {
                        repository: {}
                    };
                    callback(err, JSON.stringify(data));
                }
            }
        });

        // act
        expect(function() {
            module({
                path: 'hejsan'
            });
        }).to.throw('ABORTING: No repository information found in bower.json');

        // assert
    });

    it('should throw if bower.json does contain repository type information', function() {
        // align
        var existsSyncStub = sinon.stub();
        existsSyncStub.returns(true);

        module = proxyquire('../lib', {
            fs: {
                existsSync: existsSyncStub,
                readFile: function(path, callback) {
                    var err;
                    var data = {
                        repository: {
                            url: 'http://github.com'
                        }
                    };
                    callback(err, JSON.stringify(data));
                }
            }
        });

        // act
        expect(function() {
            module({
                path: 'hejsan'
            });
        }).to.throw('ABORTING: No repository information found in bower.json');

        // assert
    });

    it('should throw if it\'s not a git repository', function() {
        // align
        var existsSyncStub = sinon.stub();
        existsSyncStub.returns(true);

        module = proxyquire('../lib', {
            fs: {
                existsSync: existsSyncStub,
                readFile: function(path, callback) {
                    var err;
                    var data = {
                        repository: {
                            url: 'http://github.com',
                            type: 'svn'
                        }
                    };
                    callback(err, JSON.stringify(data));
                }
            }
        });

        // act
        expect(function() {
            module({
                path: 'hejsan'
            });
        }).to.throw('ABORTING: Not a git repository');

        // assert
    });

    it('should throw if exec(git) fails', function() {
        // align
        var existsSyncStub = sinon.stub();
        existsSyncStub.returns(true);

        module = proxyquire('../lib', {
            fs: {
                existsSync: existsSyncStub,
                readFile: function(path, callback) {
                    var err;
                    var data = {
                        repository: {
                            url: 'http://github.com',
                            type: 'git'
                        }
                    };
                    callback(err, JSON.stringify(data));
                }
            },
            // jscs:disable
            child_process: {
                // jscs:enable
                exec: function(path, callback) {
                    var err = 'exec err';
                    callback(err);
                }
            }
        });
        module.testMode = true;

        // act
        expect(function() {
            module({
                path: 'hejsan'
            });
        }).to.throw('exec err');

        // assert
    });

    it('should throw if deleting bower component folder fails', function() {
        // align
        var existsSyncStub = sinon.stub();
        existsSyncStub.returns(true);

        module = proxyquire('../lib', {
            fs: {
                existsSync: existsSyncStub,
                readFile: function(path, callback) {
                    var err;
                    var data = {
                        repository: {
                            url: 'http://github.com',
                            type: 'git'
                        }
                    };
                    callback(err, JSON.stringify(data));
                }
            },
            // jscs:disable
            child_process: {
                // jscs:enable
                exec: function(path, callback) {
                    var err;
                    callback(err);
                }
            },
            del: function() {
                return new Promise(function(resolve, reject) {
                    reject();
                });
            }
        });
        module.testMode = true;

        expect(
            module({
                path: 'hejsan'
            })
        ).to.be.rejectedWith('Could not delete bower component in hejsan');

        // assert
    });
});
