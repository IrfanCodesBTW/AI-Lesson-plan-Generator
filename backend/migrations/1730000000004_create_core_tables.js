/* eslint-disable camelcase */
exports.shorthands = undefined;

exports.up = (pgm) => {
  // Classrooms Table
  pgm.createTable('classrooms', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    name: { type: 'text', notNull: true },
    capacity: { type: 'integer', notNull: true },
    teacher_id: { type: 'uuid', references: '"users"(id)', onDelete: 'SET NULL' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  // Parents Table
  pgm.createTable('parents', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    user_id: { type: 'uuid', references: '"users"(id)', onDelete: 'CASCADE' }, // if parent registers as a user later
    name: { type: 'text', notNull: true },
    email: { type: 'text' },
    phone: { type: 'text' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  // Children Table
  pgm.createTable('children', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    parent_id: { type: 'uuid', references: '"parents"(id)', onDelete: 'CASCADE', notNull: true },
    classroom_id: { type: 'uuid', references: '"classrooms"(id)', onDelete: 'SET NULL' },
    name: { type: 'text', notNull: true },
    dob: { type: 'date', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  // Curriculum Activities Table
  pgm.createTable('curriculum_activities', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    theme: { type: 'text', notNull: true },
    week_number: { type: 'integer', notNull: true },
    details: { type: 'text', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  // Milestones Table
  pgm.createTable('milestones', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    child_id: { type: 'uuid', references: '"children"(id)', onDelete: 'CASCADE', notNull: true },
    description: { type: 'text', notNull: true },
    achieved_date: { type: 'date', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  // Feedback Table
  pgm.createTable('feedback', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    parent_id: { type: 'uuid', references: '"parents"(id)', onDelete: 'CASCADE', notNull: true },
    message: { type: 'text', notNull: true },
    date: { type: 'date', notNull: true, default: pgm.func('current_date') },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  // Fees Table
  pgm.createTable('fees', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    child_id: { type: 'uuid', references: '"children"(id)', onDelete: 'CASCADE', notNull: true },
    amount: { type: 'numeric(10,2)', notNull: true },
    status: { type: 'text', notNull: true, check: "status IN ('paid', 'pending', 'overdue')" },
    due_date: { type: 'date', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  // Occupancy Table
  pgm.createTable('occupancy', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    classroom_id: {
      type: 'uuid',
      references: '"classrooms"(id)',
      onDelete: 'CASCADE',
      notNull: true,
    },
    current_count: { type: 'integer', notNull: true, default: 0 },
    max_capacity: { type: 'integer', notNull: true },
    date: { type: 'date', notNull: true, default: pgm.func('current_date') },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  // Transport Table
  pgm.createTable('transport', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    child_id: { type: 'uuid', references: '"children"(id)', onDelete: 'CASCADE', notNull: true },
    route: { type: 'text', notNull: true },
    driver_name: { type: 'text', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  // Supplies Table
  pgm.createTable('supplies', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    item_name: { type: 'text', notNull: true },
    quantity: { type: 'integer', notNull: true },
    status: {
      type: 'text',
      notNull: true,
      check: "status IN ('in_stock', 'low_stock', 'out_of_stock')",
    },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  // Communication History Table
  pgm.createTable('communication_history', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    parent_id: { type: 'uuid', references: '"parents"(id)', onDelete: 'CASCADE', notNull: true },
    type: { type: 'text', notNull: true, check: "type IN ('whatsapp', 'email', 'sms')" },
    message: { type: 'text', notNull: true },
    sent_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('communication_history');
  pgm.dropTable('supplies');
  pgm.dropTable('transport');
  pgm.dropTable('occupancy');
  pgm.dropTable('fees');
  pgm.dropTable('feedback');
  pgm.dropTable('milestones');
  pgm.dropTable('curriculum_activities');
  pgm.dropTable('children');
  pgm.dropTable('parents');
  pgm.dropTable('classrooms');
};
