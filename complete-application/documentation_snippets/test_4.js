test('test lambda rejects sanctioned emails and accepts others', async function (t) {
  t.plan(2);

  fetchMock.get('https://issanctioned.example.com/api/banned?email=kim%40company.kp', { isBanned: true });
  const jwt1 = {};
  await populate(jwt1, {email: 'kim@company.kp'}, {});
  t.true(jwt1.isBanned, 'Check North Korea email banned');

  fetchMock.get('https://issanctioned.example.com/api/banned?email=kim%40company.ca', { isBanned: false });
  const jwt2 = {};
  await populate(jwt2, {email: 'kim@company.ca'}, {});
  t.false(jwt2.isBanned, 'Check Canada email allowed');

  fetchMock.restore();
  t.end();
});