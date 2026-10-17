const axios = require('axios');

const LANG_CONFIG = {
  javascript: { label: 'JavaScript' },
  cpp: { label: 'C++' },
  java: { label: 'Java' },
  python3: { label: 'Python3' },
};

function getStarterCode(prob, lang) {
  const langKey = (lang || 'javascript').toLowerCase().trim();
  const langLabel = (LANG_CONFIG[lang]?.label || lang || 'JavaScript').toLowerCase().trim();

  if (Array.isArray(prob?.startCode)) {
    const found = prob.startCode.find((sc) => {
      const l = (sc.language || sc.lang || '').toLowerCase().trim();
      return (
        l === langKey ||
        l === langLabel ||
        (langKey === 'python3' && (l === 'python' || l === 'python3' || l === 'py')) ||
        (langKey === 'python' && (l === 'python' || l === 'python3' || l === 'py')) ||
        (langKey === 'cpp' && (l === 'c++' || l === 'cpp')) ||
        (langKey === 'c++' && (l === 'c++' || l === 'cpp')) ||
        (langKey === 'javascript' && (l === 'js' || l === 'javascript'))
      );
    });
    if (found && typeof found.initialCode === 'string' && found.initialCode.trim().length > 30) {
      return found.initialCode;
    }
  }
  return null;
}

async function verify() {
  const res = await axios.get('http://localhost:3000/api/problem/allProblem');
  const problems = res.data.problems || res.data;
  console.log(`Verifying starter code for all ${problems.length} problems...`);

  let allSuccess = true;
  for (const p of problems) {
    const detailRes = await axios.get(`http://localhost:3000/api/problem/problemById/${p._id}`);
    const prob = detailRes.data;
    for (const lang of ['javascript', 'cpp', 'java', 'python3']) {
      const code = getStarterCode(prob, lang);
      if (!code) {
        console.error(`MISSING starter code: Problem #${prob.problemNumber} "${prob.title}" for language "${lang}"`);
        allSuccess = false;
      }
    }
  }

  if (allSuccess) {
    console.log(`ALL ${problems.length} problems successfully verified! Starter templates present for JavaScript, C++, Java, and Python3!`);
  }
}

verify().catch(e => console.error('Error:', e.message));
