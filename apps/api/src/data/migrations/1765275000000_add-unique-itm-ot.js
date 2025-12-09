/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.addConstraint('itm_ot', 'itm_ot_unique_item_per_ot', {
        unique: ['ot_id', 'item_id']
    });
};

exports.down = pgm => {
    pgm.dropConstraint('itm_ot', 'itm_ot_unique_item_per_ot');
};
