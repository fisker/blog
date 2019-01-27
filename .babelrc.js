module.exports = {
  "presets": [
    [
      "@babel/env",
      {
        "targets": {
          "ie": "8",
          "chrome": "1",
          "browsers": [
            "last 100 versions",
            "ie >=6"
          ]
        }
      }
    ]
  ]
}
