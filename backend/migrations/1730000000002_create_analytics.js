/* eslint-disable camelcase */
exports.shorthands = undefined;

exports.up = (pgm) => {
  // Tasks Table
  pgm.createTable('tasks', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    user_id: {
      type: 'uuid',
      notNull: true,
      references: '"users"(id)',
      onDelete: 'CASCADE',
    },
    title: { type: 'text', notNull: true },
    completed: { type: 'boolean', notNull: true, default: false },
    completed_at: { type: 'timestamptz', default: null },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
  pgm.createIndex('tasks', ['user_id', 'created_at']);

  // Focus Sessions Table
  pgm.createTable('focus_sessions', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    user_id: {
      type: 'uuid',
      notNull: true,
      references: '"users"(id)',
      onDelete: 'CASCADE',
    },
    hours: { type: 'numeric(5,2)', notNull: true },
    activity_type: {
      type: 'text',
      notNull: true,
      check: "activity_type IN ('planning', 'teaching', 'grading', 'focus_session')",
    },
    date: { type: 'date', notNull: true, default: pgm.func('current_date') },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
  pgm.createIndex('focus_sessions', ['user_id', 'date']);

  // Student Metrics Table
  pgm.createTable('student_metrics', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    user_id: {
      type: 'uuid',
      notNull: true,
      references: '"users"(id)',
      onDelete: 'CASCADE',
    },
    student_name: { type: 'text', notNull: true },
    activity_name: { type: 'text', notNull: true },
    score: { type: 'integer', check: 'score >= 0 AND score <= 100' },
    attendance_status: {
      type: 'text',
      check: "attendance_status IN ('present', 'absent', 'tardy')",
    },
    engagement_score: { type: 'integer', check: 'engagement_score >= 1 AND engagement_score <= 5' },
    date: { type: 'date', notNull: true, default: pgm.func('current_date') },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
  pgm.createIndex('student_metrics', ['user_id', 'date']);

  // AI Insights Table
  pgm.createTable('ai_insights', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    user_id: {
      type: 'uuid',
      notNull: true,
      references: '"users"(id)',
      onDelete: 'CASCADE',
    },
    title: { type: 'text', notNull: true },
    description: { type: 'text', notNull: true },
    type: {
      type: 'text',
      notNull: true,
      check: "type IN ('classroom_engagement', 'learning_gaps', 'resource_suggestions')",
    },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
  pgm.createIndex('ai_insights', ['user_id', 'created_at']);
};

exports.down = (pgm) => {
  pgm.dropTable('ai_insights');
  pgm.dropTable('student_metrics');
  pgm.dropTable('focus_sessions');
  pgm.dropTable('tasks');
};
