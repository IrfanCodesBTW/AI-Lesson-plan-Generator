/* eslint-disable camelcase */
exports.shorthands = undefined;

exports.up = (pgm) => {
  // Parent Enquiries Table
  pgm.createTable('parent_enquiries', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    user_id: {
      type: 'uuid',
      notNull: true,
      references: '"users"(id)',
      onDelete: 'CASCADE',
    },
    parent_name: { type: 'text', notNull: true },
    child_name: { type: 'text', notNull: true },
    child_age: { type: 'integer', notNull: true },
    status: {
      type: 'text',
      notNull: true,
      default: 'pending',
      check: "status IN ('pending', 'contacted', 'admitted', 'rejected')",
    },
    remarks: { type: 'text', default: null },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
  pgm.createIndex('parent_enquiries', ['user_id', 'created_at']);

  // Daycare Routines Table
  pgm.createTable('daycare_routines', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    user_id: {
      type: 'uuid',
      notNull: true,
      references: '"users"(id)',
      onDelete: 'CASCADE',
    },
    child_name: { type: 'text', notNull: true },
    routine_type: {
      type: 'text',
      notNull: true,
      check: "routine_type IN ('meal', 'nap', 'diaper', 'activity')",
    },
    detail: { type: 'text', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
  pgm.createIndex('daycare_routines', ['user_id', 'created_at']);
};

exports.down = (pgm) => {
  pgm.dropTable('daycare_routines');
  pgm.dropTable('parent_enquiries');
};
