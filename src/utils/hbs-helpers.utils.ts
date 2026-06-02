export const hbsHelpers = {
  ifEquals: function (a: any, b: any, options: any) {
    return a === b ? options.fn(this) : options.inverse(this);
  },
  debug: function (value: any) {
    console.log('DEBUG:', value);
    return ''; // renders nothing
  },
  typeof: function (value: any) {
    return typeof value;
  },
};
