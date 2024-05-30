const { workspaceRoot } = require('@nrwl/devkit');
const path = require('node:path');
const parse5 = require('parse5');

function transform(targetOptions, indexHtml) {
  console.log('\n⠋ transforming index.html:');

  const doc = parse5.parse(indexHtml);

  console.log('\t- inserting Content Security Policy');
  insertCSP(targetOptions.configuration, doc);

  return parse5.serialize(doc);
}

function insertCSP(configuration, doc) {
  function buildCSP(content) {
    const csp = {};

    content.forEach(record => {
      record.directives.forEach(dir => (csp[dir] ? csp[dir].push(record.resource) : (csp[dir] = [record.resource])));
    });

    return Object.entries(csp)
      .map(([directive, values]) => `${directive} ${values.join(' ')};`)
      .join(' ');
  }

  let csp = buildCSP(require(path.join(workspaceRoot, 'CSP.json')));

  const head = doc.childNodes.find(c => c.nodeName === 'html').childNodes.find(c => c.nodeName === 'head');

  head.childNodes.push({
    nodeName: 'meta',
    tagName: 'meta',
    attrs: [
      { name: 'http-equiv', value: 'Content-Security-Policy' },
      { name: 'content', value: csp },
      { name: 'charset', value: 'utf-8' }
    ]
  });
}

module.exports = transform;
