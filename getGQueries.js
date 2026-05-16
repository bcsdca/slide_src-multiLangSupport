function getGQueries(isTesting) {
  const worshipBase = 'subject:"本週崇拜通報/祈禱表和主日崇拜訊息"';
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