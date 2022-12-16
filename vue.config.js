const WebpackCdnUploadPlugin = require("webpack-cdn-upload-plugin")
const pkgVersion = require('./package.json').version;
const pkgName = require('./package.json').name;
const axios = require("axios")

module.exports = {
    css: {
        extract: false,
    },

    filenameHashing: false,
    chainWebpack: config => {
        config.module.rules.delete('eslint')
        if (process.env.NODE_ENV === "development") {
          config.entry("app").clear().add("./src/main.js").end();
        } else if (process.env.NODE_ENV === "preproduction" || process.env.NODE_ENV === "production") {
          config.entry("app").clear().add("./src/main.production.js").end();
        }
        config.module
        .rule('images')
          .use('url-loader')
            .loader('url-loader')
            .tap(options => Object.assign(options, { limit: 10240 }))
    },
    configureWebpack: config => {
        if (process.env.NODE_ENV === "preproduction" || process.env.NODE_ENV === "production") {
            return {
                optimization: {
                    splitChunks: false
                },
                plugins: [

                    new WebpackCdnUploadPlugin({
                        async upload(content, name) {
                            if (name.endsWith(".map")) {
                                //We ignore sourcemap file
                                return;
                            }
                            
                            let repo = "release";
                            if (pkgVersion.toLowerCase().endsWith("snapshot")) {
                                repo = "snapshot"
                            }
                            let artifactName = pkgName;
                            if (process.VUE_CLI_SERVICE.mode === "preproduction") {
                                artifactName = pkgName + "_preproduction";
                            }
                            let url = "https://api.sedoo.fr/aeris-cdn-rest/jsrepo/v1_0/webpackupload/sandbox/" + repo + "/" + artifactName + "/" + pkgVersion
                            console.log(url)

                            await axios({
                                method: 'post',
                                url: url,
                                maxContentLength: Infinity,
                                maxBodyLength: Infinity,
                                headers: {},
                                data: {
                                    content: content
                                }
                            });

                            url = url.replace('webpackupload', 'download')
                            return url;

                        },
                    }),
                ]
                }
            }
    },

    pluginOptions: {
      i18n: {
        locale: 'fr',
        fallbackLocale: 'en',
        localeDir: 'locales',
        enableInSFC: true
      }
    }
}
