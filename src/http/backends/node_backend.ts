import * as http from 'http';
import * as https from 'https';
import * as zlib from 'zlib';

import {Request, RequestMethods} from '../request';

function compress(response: http.IncomingMessage, data: any, compression?: string): any {
  if (!compression) {
    return data;
  }

  return response.pipe(zlib.createGunzip()).pipe(data);
}

export function nodeHttpRequest(request: Request): Promise<any> {
  const data = request.payload();

  const options: http.RequestOptions = {
    protocol: request.options.protocol + ':',
    hostname: request.options.hostname,
    port: request.options.port,
    method: RequestMethods[request.method],
    path: request.options.path,
    headers: {
      'Content-Length': Buffer.byteLength(data)
    }
  };

  request.options.headers.forEach((value, header) => {
    options.headers[header] = value;
  });

  const promise = new Promise((resolve, reject) => {
    const cb = function(response: http.IncomingMessage) {
      let data = '';

      response.setEncoding('utf8');

      response.on('data', function (chunk: string) {
        data += chunk;
      });

      response.on('end', function() {
        if (data.length) {
          if (response.headers &&
            response.headers['content-type'] &&
            response.headers['content-type'].indexOf('application/json') !== -1) {
            data = JSON.parse(data);
          }
        } else {
          data = null;
        }

        if (response.statusCode >= 200 && response.statusCode < 300) {
          resolve(data);
        } else {
          reject(data);
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

    if (options.headers['Content-Encoding']) {
      data = compress(data);
    }

    req.write(data);
    req.end();
  });

  return promise;
}
