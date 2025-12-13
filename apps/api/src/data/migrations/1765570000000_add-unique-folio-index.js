exports.up = (pgm) => {
    pgm.createIndex('ot', 'external_ot_id', {
        name: 'idx_ot_external_id_unique',
        unique: true,
        where: '"external_ot_id" IS NOT NULL'
    });
};

exports.down = (pgm) => {
    pgm.dropIndex('ot', 'external_ot_id', {
        name: 'idx_ot_external_id_unique'
    });
};
