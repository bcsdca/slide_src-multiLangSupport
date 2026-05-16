function getQueries(isTesting) {
  const worshipBase = 'subject:"worship info C"';
  const cantBase = 'subject:(Cantonese "Sunday Service")';

  return {
    worshipQuery: isTesting
      ? 'is:inbox ' + worshipBase
      : 'is:inbox newer_than:2d ' + worshipBase,
    cantQuery: isTesting
      ? 'is:inbox ' + cantBase
      : 'is:inbox newer_than:5d ' + cantBase,
  };
}