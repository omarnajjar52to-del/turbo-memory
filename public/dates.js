export const dateKey=d=>new Date(d).toLocaleDateString('en-CA',{timeZone:'Asia/Baghdad'});
export const dayOffset=n=>dateKey(new Date(Date.now()+n*86400000));
