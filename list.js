const nexusList = require('./utils/nexusList');
const fs = require('fs');

function echoHelper() {
  console.log(`need nexusRepo.json in work dir
{
    "nexusUrl": "",
    "repoName": "npm"
}`);
}

fs.readFile('./nexusRepo.json', 'utf8', (err, data) => {
  if (err) echoHelper();
  else {
    let nexusRepo = {};
    try {
      nexusRepo = JSON.parse(data);
    } catch (error) {
      echoHelper();
      return;
    }
    if (
      typeof nexusRepo.nexusUrl !== 'string' ||
      typeof nexusRepo.repoName !== 'string'
    ) {
      echoHelper();
      return;
    }
    nexusList(nexusRepo.nexusUrl, nexusRepo.repoName).then(packages => {
      nexusRepo.packages = packages;
      fs.writeFileSync(
        './nexusRepo.json',
        JSON.stringify(nexusRepo, undefined, 4),
      );
    });
  }
});
