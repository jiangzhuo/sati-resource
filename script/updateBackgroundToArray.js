db.home.find( { } ).forEach( function (x) {
    x.background = [ x.background ];
    db.home.save(x);
});
db.mindfulness.find( { } ).forEach( function (x) {
    x.background = [ x.background ];
    db.mindfulness.save(x);
});
db.nature.find( { } ).forEach( function (x) {
    x.background = [ x.background ];
    db.nature.save(x);
});
db.wander.find( { } ).forEach( function (x) {
    x.background = [ x.background ];
    db.wander.save(x);
});
db.wanderAlbum.find( { } ).forEach( function (x) {
    x.background = [ x.background ];
    db.wanderAlbum.save(x);
});
