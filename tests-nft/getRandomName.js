const charactersaz = "a,z,e,r,t,y,u,i,o,p,q,s,d,f,g,h,j,k,l,m,w,x,c,v,b,n".split(',');
const charactersaz09 = charactersaz.concat('0,1,2,3,4,5,6,7,8,9'.split(','));

module.exports.main = (onlyaz = false) => {
  let name = '';
  for (let i = 0; i < 6; i += 1) {
    name += charactersaz09[Math.floor(Math.random() * 36)];
  }
  return name;
};
