import * as http from 'http';
import * as https from 'https';
import * as zlib from 'zlib';

import * as fs from 'fs';

import {Request, RequestMethods} from '../request';

export function nodeHttpRequest(request: Request): Promise<any> {
  let data = request.payload();

  if (request.options.headers.get('Content-Encoding') === 'gzip') {
      data = zlib.gzipSync(new Buffer(data));
  }

  const options: http.RequestOptions = {
    protocol: request.options.protocol + ':',
    hostname: request.options.hostname,
    port: request.options.port,
    method: RequestMethods[request.method],
    path: request.options.path,
    headers: {
      'Content-Length': data.length
    }
  };

  request.options.headers.forEach((value, header) => {
    options.headers[header] = value;
  });

  const promise = new Promise((resolve, reject) => {
    const cb = function(response: http.IncomingMessage) {
      const buffers: Array<Buffer> = [];

      response.on('data', function (chunk: Buffer) {
        buffers.push(chunk);
      });

      response.on('end', function() {
        const buffer = Buffer.concat(buffers);
        let payload: string;

        if (response.headers['content-encoding'] === 'gzip') {
          payload = zlib.gunzipSync(buffer);
        } else {
          payload = buffer.toString();
        }

        if (payload.length) {
          if (response.headers &&
            response.headers['content-type'] &&
            response.headers['content-type'].indexOf('application/json') !== -1) {

            payload = JSON.parse(payload);
          }
        } else {
          payload = null;
        }

        if (response.statusCode >= 200 && response.statusCode < 300) {
          resolve(payload);
        } else {
          reject(payload);
        }
      });
    };

    let req: http.ClientRequest;

    if (request.options.protocol === 'https') {
      req = https.request(options, cb);
    } else {
      req = http.request(options, cb);
    }

    req.on('error', (error: any) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });

  return promise;
}
