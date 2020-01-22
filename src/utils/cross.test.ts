import cross from './cross';

it('cross', () => {
  expect(cross(['a1', 'a1'], ['b1', 'b2'])).toMatchInlineSnapshot(`
    Array [
      Array [
        "a1",
        "b1",
      ],
      Array [
        "a1",
        "b2",
      ],
      Array [
        "a1",
        "b1",
      ],
      Array [
        "a1",
        "b2",
      ],
    ]
  `);
});
