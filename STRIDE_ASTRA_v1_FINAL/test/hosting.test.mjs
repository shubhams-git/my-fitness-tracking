import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {createApp} from '../src/server.mjs';
import {request} from 'node:http';

const get=(path,headers)=>new Promise((resolve,reject)=>{
  const req=request({hostname:'127.0.0.1',port:4390,path,headers},res=>{let body='';res.setEncoding('utf8');res.on('data',chunk=>body+=chunk);res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,body}));});
  req.on('error',reject);req.end();
});

test('Render public origin is accepted while unrelated hosts and origins are rejected',async()=>{
  const previous=process.env.RENDER_EXTERNAL_URL;
  const previousOrigin=process.env.STRIDE_ORIGIN;
  process.env.RENDER_EXTERNAL_URL='https://stride-hosting-test.onrender.com';
  delete process.env.STRIDE_ORIGIN;
  let app;
  try{app=createApp({dataDir:await mkdtemp(join(tmpdir(),'stride-render-')),port:4390});}
  finally{if(previous===undefined)delete process.env.RENDER_EXTERNAL_URL;else process.env.RENDER_EXTERNAL_URL=previous;if(previousOrigin===undefined)delete process.env.STRIDE_ORIGIN;else process.env.STRIDE_ORIGIN=previousOrigin;}
  await new Promise(resolve=>app.server.listen(4390,'127.0.0.1',resolve));
  try{
    const valid={Host:'stride-hosting-test.onrender.com',Origin:'https://stride-hosting-test.onrender.com'};
    const health=await get('/health',valid);
    assert.equal(health.status,200);
    assert.match(health.headers['strict-transport-security'],/max-age/);
    const auth=await get('/api/auth',valid);
    assert.equal(auth.status,200);assert.equal(JSON.parse(auth.body).authenticated,false);
    assert.equal((await get('/health',{...valid,Host:'untrusted.example'})).status,403);
    assert.equal((await get('/health',{...valid,Origin:'https://untrusted.example'})).status,403);
  }finally{await new Promise(resolve=>app.server.close(resolve));}
});
