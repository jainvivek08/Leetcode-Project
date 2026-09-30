const axios = require('axios');


const getLanguageById = (lang)=>{
    if (!lang) return 63;
    const language = {
        "c++": 54,
        "cpp": 54,
        "java": 62,
        "javascript": 63,
        "js": 63,
        "python": 71,
        "py": 71
    };

    return language[lang.toLowerCase().trim()] || 63;
}


const submitBatch = async (submissions)=>{
  if (!Array.isArray(submissions) || submissions.length === 0) {
    return [];
  }

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
      submissions
    }
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error("submitBatch error:", error.response?.data || error.message);
    throw error;
  }
}


const waiting = (timer) => new Promise(resolve => setTimeout(resolve, timer));

// ["db54881d-bcf5-4c7b-a2e3-d33fe7e25de7","ecc52a9b-ea80-4a00-ad50-4ab6cc3bb2a1","1b35ec3b-5776-48ef-b646-d5522bdeb2cc"]

const submitToken = async(resultToken)=>{
  if (!Array.isArray(resultToken) || resultToken.length === 0) {
    return [];
  }

  const options = {
    method: 'GET',
    url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
    params: {
      tokens: resultToken.join(","),
      base64_encoded: 'false',
      fields: '*'
    },
    headers: {
      'x-rapidapi-key': process.env.JUDGE0_KEY,
      'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
    }
  };

  let attempts = 0;
  const maxAttempts = 30;

  while(attempts < maxAttempts){
    attempts++;
    try {
      const response = await axios.request(options);
      const result = response.data;
      if (result && Array.isArray(result.submissions)) {
        const IsResultObtained = result.submissions.every((r) => r.status_id > 2);
        if(IsResultObtained)
          return result.submissions;
      }
    } catch (error) {
      console.error("submitToken error:", error.response?.data || error.message);
    }

    await waiting(1000);
  }

  throw new Error("Judge0 execution timed out");
}


module.exports = {getLanguageById,submitBatch,submitToken};








// 


