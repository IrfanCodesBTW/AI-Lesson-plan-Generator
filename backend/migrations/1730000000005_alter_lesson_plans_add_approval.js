/* eslint-disable camelcase */
exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumn('lesson_plans', {
    approval_status: {
      type: 'text',
      notNull: true,
      default: 'pending',
      check: "approval_status IN ('pending', 'approved', 'rejected')",
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('lesson_plans', 'approval_status');
};
