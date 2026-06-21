/**
 * swagger.json 을 기준으로 api service 파일을 generate
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
import { generateApi } from 'swagger-typescript-api'
import path from 'path'
import fs from 'fs'
import { exec } from 'child_process'
import dotenv from 'dotenv'

dotenv.config({ path: process.argv[2] })

/** 제외할 Tag 목록 */
/** 태그필터 논의필요 */
const TAG_FILTER = []

/** 기본 생성 파일 */
const REQUIRED_FILE = ['data-contracts', 'http-client']

/** swagger.json url */
const SWAGGER_URL = `${process.env.VITE_API_SERVER_GENERATE}/docs/public`

/** service class 파일 생성 경로 */
const OUTPUT_DIR = path.resolve(process.cwd(), 'src/service/api/generated')

/** service index 파일 생성 경로 */
const INDEX_DIR = path.resolve(process.cwd(), 'src/service/api/index.ts')

generateApi({
  name: 'ApiSeoulland.ts',
  output: OUTPUT_DIR,
  url: SWAGGER_URL,
  modular: true,
  moduleNameFirstTag: true,
  cleanOutput: true,
  singleHttpClient: true,
  httpClientType: 'axios'
  // toJS: true
})
  .then(({ files, configuration }) => {
    removeUnnecessaryApis(files)
    createIndexFile(files)
    formatIndexFile()
  })
  .catch((e) => console.error(e))

/**
 * 제외할 Tag 의 API 제거
 */
function removeUnnecessaryApis(files) {
  files
    .filter(
      (_file) => TAG_FILTER.includes(_file.fileName) && !REQUIRED_FILE.includes(_file.fileName)
    )
    .forEach((_file) => {
      const path = `${OUTPUT_DIR}/${_file.fileName}${_file.fileExtension}`
      fs.unlink(path, (e) => {
      })

      console.log(`🔥 api file "${_file.fileName}" removed in ${OUTPUT_DIR}`)
    })
}

/**
 * generate index.js
 */
function createIndexFile(files) {
  fs.writeFile(`${INDEX_DIR}`, getIndexTemplate(files), (e) => {
    if (e) {
      console.error(`index file generate error: ${e}`)
    }
  })
}

/**
 * index.js template
 */
function getIndexTemplate(files) {
  const filtered = files.filter(
    (_file) => !TAG_FILTER.includes(_file.fileName) && !REQUIRED_FILE.includes(_file.fileName)
  )

  const importApi = filtered.reduce(
    (result, _file) =>
      result.concat(`import { ${_file.fileName} } from './generated/${_file.fileName}';\n`),
    ''
  )

  const createInstance = filtered.reduce(
    (result, _file) =>
      result.concat(
        `export const ${_file.fileName.toLowerCase()}Api = new ${_file.fileName}(httpClient);\n`
      ),
    ''
  )

  const exportApi = filtered.reduce(
    (result, _file) => result.concat(`${_file.fileName}: ${_file.fileName.toLowerCase()}Api,\n`),
    ''
  )

  return `
          /************************************
           * GENERATED CODE
           ************************************/
          import { api } from '@/common/library/axios';
          import { HttpClient } from './generated/http-client';
          ${importApi}
          const httpClient = new HttpClient();
          httpClient.instance = api;

          ${createInstance}
          export default {
          ${exportApi}};
        `
}

/**
 * Prettier Foramtting
 */
function formatIndexFile() {
  exec(`npx prettier --write ${INDEX_DIR}`, (err, stdout, stderr) => {
    if (err) {
      console.error(`Error while formatting: ${stderr}`)
      return
    }
    console.log(`File formatted successfully:\n${stdout}`)
  })
}
