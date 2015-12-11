/* global describe, it, expect, beforEach */

var expect = require('chai').expect;
var mocha = require('mocha');
var proxyquire = require('proxyquire');
var sinon = require('sinon');

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
});
