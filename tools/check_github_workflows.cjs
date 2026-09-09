const https = require('https');

const pat = process.env.GITHUB_PAT || process.env.GITHUB_TOKEN || '';

function checkWorkflows(repo) {
  const options = {
    hostname: 'api.github.com',
    path: '/repos/' + repo + '/actions/workflows',
    headers: {
      'User-Agent': 'Antigravity-Agent',
      'Authorization': 'Bearer ' + pat,
      'Accept': 'application/vnd.github+json'
    }
  };

  https.get(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('Workflows for ' + repo + ': (status ' + res.statusCode + ')');
      try {
        const json = JSON.parse(data);
        console.log(json.workflows ? json.workflows.map(w => ({ id: w.id, name: w.name, state: w.state, path: w.path })) : json);
      } catch (e) {
        console.log(data);
      }
    });
  }).on('error', console.error);
}

checkWorkflows('nubeplay7/Open-Source-App-Store');
checkWorkflows('nubeplay7/Open-Source-App-Store-last');
