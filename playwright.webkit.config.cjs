module.exports={
 testDir:'./tests',testMatch:'safari-webkit.spec.cjs',
 timeout:90000,
 use:{
  baseURL:'http://127.0.0.1:8765',
  viewport:{width:844,height:390},
  hasTouch:true,isMobile:true,
  browserName:'webkit',trace:'retain-on-failure'
 },
 webServer:{command:'python3 -m http.server 8765 --directory dist',port:8765},
 reporter:[['list']]
};
