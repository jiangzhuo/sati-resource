db.mindfulness.find( { } ).forEach( function (x) {
    x.validTime = x.createTime;
    db.mindfulness.save(x);
});
db.nature.find( { } ).forEach( function (x) {
    x.validTime = x.createTime;
    db.nature.save(x);
});
db.wander.find( { } ).forEach( function (x) {
    x.validTime = x.createTime;
    db.wander.save(x);
});
db.wanderAlbum.find( { } ).forEach( function (x) {
    x.validTime = x.createTime;
    db.wanderAlbum.save(x);
});
