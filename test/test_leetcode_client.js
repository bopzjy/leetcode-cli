var _ = require('underscore');
var assert = require('chai').assert;
var nock = require('nock');

var client = require('../lib/leetcode_client');
var config = require('../lib/config');
var core = require('../lib/core');

describe('leetcode_client', function() {
  var USER = {hash: 'abcdef'};
  var PROBLEM = {
    id:     389,
    name:   'Find the Difference',
    key:    'find-the-difference',
    link:   'https://leetcode.com/problems/find-the-difference',
    locked: false,
    file:   '/dev/null'
  };

  before(function() {
    config.init();
  });

  describe('#autologin', function() {
    var _core;

    before(function() {
      _core = _.clone(core);

      core.getUser = function() {
        return {};
      };
      core.login = function(user, cb) {
        return cb(null, user);
      };
    });

    // restore to original 'core'
    after(function() {
      _.extendOwn(core, _core);
    });

    it('should ok', function(done) {
      config.AUTO_LOGIN = true;
      nock(config.URL_PROBLEMS).get('/').reply(403);
      nock(config.URL_PROBLEMS).get('/').replyWithFile(200, './test/mock/problems.json.20160911');

      client.getProblems(function(e, problems) {
        assert.equal(e, null);
        assert.equal(problems.length, 377);
        done();
      });
    });

    it('should fail if no auto login', function(done) {
      config.AUTO_LOGIN = false;
      nock(config.URL_PROBLEMS).get('/').reply(403);

      client.getProblems(function(e, problems) {
        var expected = {
          msg:        'session expired, please login again',
          statusCode: 403
        };
        assert.deepEqual(e, expected);
        done();
      });
    });

    it('should fail if other error', function(done) {
      config.AUTO_LOGIN = true;
      nock(config.URL_PROBLEMS).get('/').reply(503);

      client.getProblems(function(e, problems) {
        var expected = {
          msg:        'http error',
          statusCode: 503
        };
        assert.deepEqual(e, expected);
        done();
      });
    });

    it('should fail if http error in relogin', function(done) {
      config.AUTO_LOGIN = true;
      nock(config.URL_PROBLEMS).get('/').reply(403);
      core.login = function(user, cb) {
        return cb('unknown error!');
      };

      // the original error will be returned instead
      var expected = {
        msg:        'session expired, please login again',
        statusCode: 403
      };
      client.getProblems(function(e, problems) {
        assert.deepEqual(e, expected);
        done();
      });
    });
  });

  describe('#getProblems', function() {
    it('should ok', function(done) {
      nock(config.URL_PROBLEMS).get('/').replyWithFile(200, './test/mock/problems.json.20160911');

      client.getProblems(function(e, problems) {
        assert.equal(e, null);
        assert.equal(problems.length, 377);
        done();
      });
    });

    it('should fail if not login', function(done) {
      nock(config.URL_PROBLEMS).get('/').replyWithFile(200, './test/mock/problems.nologin.json.20161015');

      client.getProblems(function(e, problems) {
        assert.equal(e, 'session expired, please login again');
        done();
      });
    });
  }); // #getProblems

  describe('#getProblem', function() {
    it('should ok', function(done) {
      nock('https://leetcode.com')
        .get('/problems/find-the-difference')
        .replyWithFile(200, './test/mock/find-the-difference.html.20170424');

      client.getProblem(PROBLEM, function(e, problem) {
        assert.equal(e, null);
        assert.equal(problem.totalAC, 63380);
        assert.equal(problem.totalSubmit, 123178);
        assert.equal(problem.desc,
          [
            '',
            'Given two strings s and t which consist of only lowercase letters.',
            '',
            'String t is generated by random shuffling string s and then add one more letter at a random position.',
            '',
            'Find the letter that was added in t.',
            '',
            'Example:',
            '',
            'Input:',
            's = "abcd"',
            't = "abcde"',
            '',
            'Output:',
            'e',
            '',
            'Explanation:',
            "'e' is the letter that was added.",
            ''
          ].join('\r\n'));

        assert.equal(problem.templates.length, 7);

        assert.equal(problem.templates[0].value, 'cpp');
        assert.equal(problem.templates[0].text, 'C++');
        assert.equal(problem.templates[0].defaultCode,
          [
            'class Solution {',
            'public:',
            '    char findTheDifference(string s, string t) {',
            '        ',
            '    }',
            '};'
          ].join('\r\n'));

        assert.equal(problem.templates[1].value, 'java');
        assert.equal(problem.templates[1].text, 'Java');
        assert.equal(problem.templates[1].defaultCode,
          [
            'public class Solution {',
            '    public char findTheDifference(String s, String t) {',
            '        ',
            '    }',
            '}'
          ].join('\r\n'));

        assert.equal(problem.templates[2].value, 'python');
        assert.equal(problem.templates[2].text, 'Python');
        assert.equal(problem.templates[2].defaultCode,
          [
            'class Solution(object):',
            '    def findTheDifference(self, s, t):',
            '        """',
            '        :type s: str',
            '        :type t: str',
            '        :rtype: str',
            '        """',
            '        '
          ].join('\r\n'));

        assert.equal(problem.templates[3].value, 'c');
        assert.equal(problem.templates[3].text, 'C');
        assert.equal(problem.templates[3].defaultCode,
          [
            'char findTheDifference(char* s, char* t) {',
            '    ',
            '}'
          ].join('\r\n'));

        assert.equal(problem.templates[4].value, 'csharp');
        assert.equal(problem.templates[4].text, 'C#');
        assert.equal(problem.templates[4].defaultCode,
          [
            'public class Solution {',
            '    public char FindTheDifference(string s, string t) {',
            '        ',
            '    }',
            '}'
          ].join('\r\n'));

        assert.equal(problem.templates[5].value, 'javascript');
        assert.equal(problem.templates[5].text, 'JavaScript');
        assert.equal(problem.templates[5].defaultCode,
          [
            '/**',
            ' * @param {string} s',
            ' * @param {string} t',
            ' * @return {character}',
            ' */',
            'var findTheDifference = function(s, t) {',
            '    ',
            '};'
          ].join('\r\n'));

        assert.equal(problem.templates[6].value, 'ruby');
        assert.equal(problem.templates[6].text, 'Ruby');
        assert.equal(problem.templates[6].defaultCode,
          [
            '# @param {String} s',
            '# @param {String} t',
            '# @return {Character}',
            'def find_the_difference(s, t)',
            '    ',
            'end'
          ].join('\r\n'));
        done();
      });
    });

    it('should fail if no permission for locked', function(done) {
      PROBLEM.locked = true;
      nock('https://leetcode.com')
        .get('/problems/find-the-difference')
        .replyWithFile(200, './test/mock/locked.html.20161015');

      client.getProblem(PROBLEM, function(e, problem) {
        assert.equal(e, 'failed to load locked problem!');
        done();
      });
    });

    it('should fail if http error', function(done) {
      nock('https://leetcode.com')
        .get('/problems/find-the-difference')
        .replyWithError('unknown error!');

      client.getProblem(PROBLEM, function(e, problem) {
        assert.equal(e.message, 'unknown error!');
        done();
      });
    });
  }); // #getProblem

  describe('#testProblem', function() {
    it('should ok', function(done) {
      nock('https://leetcode.com')
        .post('/problems/find-the-difference/interpret_solution/')
        .reply(200, '{"interpret_expected_id": "id1", "interpret_id": "id2"}');

      nock('https://leetcode.com')
        .get('/submissions/detail/id1/check/')
        .reply(200, '{"state": "SUCCESS"}');

      nock('https://leetcode.com')
        .get('/submissions/detail/id2/check/')
        .reply(200, '{"state": "SUCCESS"}');

      client.testProblem(PROBLEM, function(e, results) {
        assert.equal(e, null);
        assert.deepEqual(results,
          [
            {name: 'Your', state: 'SUCCESS'},
            {name: 'Expected', state: 'SUCCESS'}
          ]);
        done();
      });
    });

    it('should fail if http error', function(done) {
      nock('https://leetcode.com')
        .post('/problems/find-the-difference/interpret_solution/')
        .replyWithError('unknown error!');

      client.testProblem(PROBLEM, function(e, results) {
        assert.equal(e.message, 'unknown error!');
        done();
      });
    });
  }); // #testProblem

  describe('#submitProblem', function() {
    it('should ok', function(done) {
      nock('https://leetcode.com')
        .post('/problems/find-the-difference/submit/')
        .reply(200, '{"submission_id": "id1"}');

      nock('https://leetcode.com')
        .get('/submissions/detail/id1/check/')
        .reply(200, '{"state": "SUCCESS"}');

      client.submitProblem(PROBLEM, function(e, results) {
        assert.equal(e, null);
        assert.deepEqual(results, [{name: 'Your', state: 'SUCCESS'}]);
        done();
      });
    });

    it('should ok after delay', function(done) {
      this.timeout(5000);

      nock('https://leetcode.com')
        .post('/problems/find-the-difference/submit/')
        .reply(200, '{"error": "You run code too soon"}');
      nock('https://leetcode.com')
        .post('/problems/find-the-difference/submit/')
        .reply(200, '{"submission_id": "id1"}');

      nock('https://leetcode.com')
        .get('/submissions/detail/id1/check/')
        .reply(200, '{"state": "STARTED"}');
      nock('https://leetcode.com')
        .get('/submissions/detail/id1/check/')
        .reply(200, '{"state": "SUCCESS"}');

      client.submitProblem(PROBLEM, function(e, results) {
        assert.equal(e, null);
        assert.deepEqual(results, [{name: 'Your', state: 'SUCCESS'}]);
        done();
      });
    });

    it('should fail if server error', function(done) {
      nock('https://leetcode.com')
        .post('/problems/find-the-difference/submit/')
        .reply(200, '{"error": "maybe internal error?"}');

      client.submitProblem(PROBLEM, function(e, results) {
        assert.equal(e, 'maybe internal error?');
        done();
      });
    });

    it('should fail if server error in check result', function(done) {
      nock('https://leetcode.com')
        .post('/problems/find-the-difference/submit/')
        .reply(200, '{"submission_id": "id1"}');

      nock('https://leetcode.com')
        .get('/submissions/detail/id1/check/')
        .replyWithError('unknown error!');

      client.submitProblem(PROBLEM, function(e, results) {
        assert.equal(e.message, 'unknown error!');
        done();
      });
    });
  }); // #submitProblem

  describe('#starProblem', function() {
    it('should star ok', function(done) {
      nock('https://leetcode.com')
        .post('/list/api/questions')
        .reply(204, '');

      client.starProblem(USER, PROBLEM, true, function(e, starred) {
        assert.equal(e, null);
        assert.equal(starred, true);
        done();
      });
    });

    it('should unstar ok', function(done) {
      nock('https://leetcode.com')
        .delete('/list/api/questions/abcdef/389')
        .reply(204, '');

      client.starProblem(USER, PROBLEM, false, function(e, starred) {
        assert.equal(e, null);
        assert.equal(starred, false);
        done();
      });
    });

    it('should star fail if http error', function(done) {
      nock('https://leetcode.com')
        .post('/list/api/questions')
        .replyWithError('unknown error!');

      client.starProblem(USER, PROBLEM, true, function(e, starred) {
        assert.equal(e.message, 'unknown error!');
        done();
      });
    });
  }); // #starProblem

  describe('#getSubmissions', function() {
    it('should ok', function(done) {
      var problem = {
        id:     1,
        name:   'Two Sum',
        key:    'two-sum',
        link:   'https://leetcode.com/problems/two-sum',
        locked: false
      };

      nock('https://leetcode.com')
        .get('/api/submissions/two-sum')
        .replyWithFile(200, './test/mock/two-sum.submissions.json.20170425');

      client.getSubmissions(problem, function(e, submissions) {
        assert.equal(e, null);
        assert.equal(submissions.length, 20);

        assert.deepEqual(submissions[0], {
          id:               '95464136',
          title:            'Two Sum',
          'is_pending':     false,
          lang:             'cpp',
          time:             '1 month, 3 weeks',
          runtime:          '12 ms',
          url:              '/submissions/detail/95464136/',
          'status_display': 'Accepted'
        });

        assert.deepEqual(submissions[1], {
          id:               '78502271',
          title:            'Two Sum',
          'is_pending':     false,
          lang:             'cpp',
          time:             '6 months, 1 week',
          runtime:          '13 ms',
          url:              '/submissions/detail/78502271/',
          'status_display': 'Accepted'
        });
        done();
      });
    });

    it('should fail if http error', function(done) {
      nock('https://leetcode.com')
        .get('/api/submissions/find-the-difference')
        .replyWithError('unknown error!');

      client.getSubmissions(PROBLEM, function(e, submissions) {
        assert.equal(e.message, 'unknown error!');
        done();
      });
    });
  }); // #getSubmissions

  describe('#getSubmission', function() {
    var SUBMISSION;

    beforeEach(function() {
      SUBMISSION = {
        id:      '73790064',
        lang:    'cpp',
        runtime: '9 ms',
        path:    '/submissions/detail/73790064/',
        state:   'Accepted'
      };
    });

    it('should ok', function(done) {
      nock('https://leetcode.com')
        .get('/submissions/detail/73790064/')
        .replyWithFile(200, './test/mock/two-sum.submission.73790064.html.20161006');

      client.getSubmission(SUBMISSION, function(e, submission) {
        assert.equal(e, null);
        assert.deepEqual(submission.code,
          [
            'class Solution {',
            'public:',
            '    vector<int> twoSum(vector<int>& nums, int target) {',
            '        return res;',
            '    }',
            '};',
            ''
          ].join('\r\n'));
        done();
      });
    });

    it('should fail if http error', function(done) {
      nock('https://leetcode.com')
        .get('/submissions/detail/73790064/')
        .replyWithError('unknown error!');

      client.getSubmission(SUBMISSION, function(e, submission) {
        assert.equal(e.message, 'unknown error!');
        done();
      });
    });

    it('should fail if no matching submission', function(done) {
      nock('https://leetcode.com')
        .get('/submissions/detail/73790064/')
        .replyWithFile(200, './test/mock/locked.html.20161015');

      client.getSubmission(SUBMISSION, function(e, submission) {
        assert.equal(e, null);
        assert.equal(submission.code, null);
        done();
      });
    });
  }); // #getSubmission

  describe('#login', function() {
    it('should ok', function(done) {
      nock(config.URL_LOGIN).get('/').reply(200, '', {
        'Set-Cookie': [
          'csrftoken=LOGIN_CSRF_TOKEN; Max-Age=31449600; Path=/; secure'
        ]
      });

      nock(config.URL_LOGIN).post('/').reply(302, '', {
        'Set-Cookie': [
          'csrftoken=SESSION_CSRF_TOKEN; Max-Age=31449600; Path=/; secure',
          'LEETCODE_SESSION=SESSION_ID; Max-Age=31449600; Path=/; secure',
          "messages='Successfully signed in as Eric.'; Max-Age=31449600; Path=/; secure"
        ]
      });

      var user = {};
      client.login(user, function(e, user) {
        assert.equal(e, null);

        assert.equal(user.loginCSRF, 'LOGIN_CSRF_TOKEN');
        assert.equal(user.sessionCSRF, 'SESSION_CSRF_TOKEN');
        assert.equal(user.sessionId, 'SESSION_ID');
        assert.equal(user.name, 'Eric');
        done();
      });
    });

    it('should fail if http error', function(done) {
      nock(config.URL_LOGIN).get('/').reply(200, '', {
        'Set-Cookie': [
          'csrftoken=LOGIN_CSRF_TOKEN; Max-Age=31449600; Path=/; secure'
        ]
      });
      nock(config.URL_LOGIN).post('/').replyWithError('unknown error!');

      var user = {};
      client.login(user, function(e, user) {
        assert.equal(e.message, 'unknown error!');
        done();
      });
    });

    it('should fail if http error, 2nd', function(done) {
      nock(config.URL_LOGIN).get('/').replyWithError('unknown error!');

      var user = {};
      client.login(user, function(e, user) {
        assert.equal(e.message, 'unknown error!');
        done();
      });
    });
  }); // #login
});

