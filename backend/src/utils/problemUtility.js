const axios = require('axios');


const normalizeLanguage = (lang) => {
  if (!lang || typeof lang !== 'string') return lang;
  const l = lang.toLowerCase().trim();
  if (l === 'cpp' || l === 'c++') return 'c++';
  if (l === 'python' || l === 'py' || l === 'python3') return 'python3';
  if (l === 'javascript' || l === 'js') return 'javascript';
  if (l === 'java') return 'java';
  return l;
};

const getLanguageById = (lang) => {
  if (!lang || typeof lang !== 'string') {
    throw new Error("Unsupported language");
  }
  const language = {
    "c++": 54,
    "cpp": 54,
    "java": 62,
    "javascript": 63,
    "js": 63,
    "python": 71,
    "py": 71,
    "python3": 71
  };

  const key = lang.toLowerCase().trim();
  const id = language[key];
  if (!id) {
    throw new Error("Unsupported language");
  }

  return id;
};

const mapJudge0Status = (test) => {
  const id = typeof test === 'object' && test !== null ? test.status_id : test;
  if (id === 3) return 'accepted';
  if (id === 4) return 'wrong';
  if (id === 5) return 'tle';
  if (id === 6) return 'compile_error';
  if (id >= 7 && id <= 12) return 'runtime_error';
  return 'error';
};

const getErrorMessage = (test) => {
  if (!test || typeof test !== 'object') return '';
  return String(test.compile_output || test.stderr || test.message || '');
};


const chunkArray = (arr, size = 20) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

const submitBatch = async (submissions) => {
  if (!Array.isArray(submissions) || submissions.length === 0) {
    return [];
  }

  const chunks = chunkArray(submissions, 20);
  const allResults = [];

  for (const chunk of chunks) {
    const options = {
      method: 'POST',
      url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
      params: {
        base64_encoded: 'false'
      },
      headers: {
        'x-rapidapi-key': process.env.JUDGE0_KEY,
        'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
        'Content-Type': 'application/json'
      },
      data: {
        submissions: chunk
      }
    };

    try {
      const response = await axios.request(options);
      if (Array.isArray(response.data)) {
        allResults.push(...response.data);
      }
    } catch (error) {
      console.error("submitBatch error:", error.response?.data || error.message);
      throw error;
    }
  }

  return allResults;
};


const waiting = (timer) => new Promise(resolve => setTimeout(resolve, timer));

const decodeBase64 = (str) => {
  if (!str || typeof str !== 'string') return str;
  try {
    return Buffer.from(str, 'base64').toString('utf-8');
  } catch {
    return str;
  }
};

const submitToken = async (resultToken) => {
  if (!Array.isArray(resultToken) || resultToken.length === 0) {
    return [];
  }

  const tokenChunks = chunkArray(resultToken, 20);
  let attempts = 0;
  const maxAttempts = !isNaN(parseInt(process.env.JUDGE0_POLL_MAX_ATTEMPTS, 10))
    ? parseInt(process.env.JUDGE0_POLL_MAX_ATTEMPTS, 10)
    : 30;
  const pollIntervalMs = !isNaN(parseInt(process.env.JUDGE0_POLL_INTERVAL_MS, 10))
    ? parseInt(process.env.JUDGE0_POLL_INTERVAL_MS, 10)
    : 1000;

  while (attempts < maxAttempts) {
    attempts++;
    try {
      const chunkResponses = await Promise.all(
        tokenChunks.map(async (chunk) => {
          const options = {
            method: 'GET',
            url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
            params: {
              tokens: chunk.join(','),
              base64_encoded: 'true',
              fields: '*'
            },
            headers: {
              'x-rapidapi-key': process.env.JUDGE0_KEY,
              'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
            }
          };
          const response = await axios.request(options);
          return response.data;
        })
      );

      let allSubmissions = [];
      let allCompleted = true;

      for (const data of chunkResponses) {
        if (!data || !Array.isArray(data.submissions)) {
          allCompleted = false;
          break;
        }
        for (const sub of data.submissions) {
          allSubmissions.push(sub);
          if (!sub.status_id || sub.status_id <= 2) {
            allCompleted = false;
          }
        }
      }

      if (allCompleted && allSubmissions.length === resultToken.length) {
        return allSubmissions.map((sub) => ({
          ...sub,
          stdout: decodeBase64(sub.stdout),
          stderr: decodeBase64(sub.stderr),
          compile_output: decodeBase64(sub.compile_output),
          message: decodeBase64(sub.message)
        }));
      }
    } catch (error) {
      console.error("submitToken error:", error.response?.data || error.message);
    }

    await waiting(pollIntervalMs);
  }

  throw new Error("Judge0 execution timed out");
};


module.exports = {
  normalizeLanguage,
  getLanguageById,
  mapJudge0Status,
  getErrorMessage,
  submitBatch,
  submitToken
};








// 


