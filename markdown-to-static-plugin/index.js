const fs = require('fs');
const path = require('path');
const glob = require('glob');
const marked = require('marked');

const TEMPLATE_REPLACE_REGEX = /<!--\s?markdown-to-html\s?-->/gi;
const MARKED_DEFAULTS = {
    renderer: new marked.Renderer(),
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: false,
    smartLists: true,
    smartypants: false
};

let userOptions;

function getTemplate(compiler, userOptions) {
  return new Promise((resolve, reject) => {
    let template = ''

    if (userOptions.template) {
        const filePath = path.join(
          compiler.context,
          userOptions.template
        );

        try {
          template = fs.readFileSync(filePath, 'utf8');
        } catch (err) {
          return reject(err);
        }
    }

    resolve(template);
  });
}

function getMarkdownFiles(compiler, userOptions) {
  return new Promise((resolve, reject) => {
    const folderToSearch = path.join(
        compiler.context,
        userOptions.path
    );

    const globOptions = {
        cwd: folderToSearch,
        root: folderToSearch,
        absolute: true
    };

    glob("**/*.md", globOptions, function(er, files) {
        const filesData = files.map(markdownFilePath => {
            let markdownContent;
            const relativePath = path.relative(compiler.context, markdownFilePath);

            try {
              markdownContent = fs.readFileSync(markdownFilePath, 'utf8');
            } catch (err) {
              return reject(err);
            }

            return {
              content: markdownContent,
              fileData: path.parse(relativePath)
            }
        });

        resolve(filesData);
    });
  });
}

function addMarkdownToHTMLTemplate(templateString, markdown) {
    return templateString.replace(TEMPLATE_REPLACE_REGEX, marked(markdown));
}

function runPlugin(compiler, compilation, callback) {
  Promise.all([
      getTemplate(compiler, userOptions),
      getMarkdownFiles(compiler, userOptions),
  ])
  .then(results => {
      const [template, markdownFiles] = results;

      markdownFiles.forEach(markdownFile => {
        const htmlContent = addMarkdownToHTMLTemplate(template, markdownFile.content);
        const htmlPath = path.join(markdownFile.fileData.dir, `${markdownFile.fileData.name}.html`);

        compilation.assets[htmlPath] = {
            source: function() {
                return htmlContent;
            },
            size: function() {
                return htmlContent.length;
            }
        };
      });

      callback();
  })
  .catch(callback);
}

// Plugin

function MarkDonwToStaticHTML(options) {
    userOptions = options;
    marked.setOptions(Object.assign(MARKED_DEFAULTS, userOptions));
}

MarkDonwToStaticHTML.prototype.apply = function(compiler) {
  compiler.plugin('emit', (compilation, callback) => runPlugin(compiler, compilation, callback));
};

module.exports = MarkDonwToStaticHTML;
