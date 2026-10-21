const DATA_COLUMNS = Object.freeze({
  number: "pt.number",
  name: "pt.name",
  symbol: "e.symbol",
  mass: "e.mass",
  category: "e.category",
  group: 'e."group"',
  period: "e.period",
  electron_configuration: "p.electron_configuration",
  electronegativity: "p.electronegativity",
  atomic_radius: "p.atomic_radius",
  ionization_energy: "p.ionization_energy",
  electron_affinity: "p.electron_affinity",
  melting_point: "p.melting_point",
  boiling_point: "p.boiling_point",
  density: "p.density",
  year_discovered: "p.year_discovered",
});

const ELEMENT_COLUMNS = new Set(["symbol", "mass", "category", "group", "period"]);
const PROPERTY_COLUMNS = new Set([
  "electron_configuration",
  "electronegativity",
  "atomic_radius",
  "ionization_energy",
  "electron_affinity",
  "melting_point",
  "boiling_point",
  "density",
  "year_discovered",
]);

export function normalizePeriodicTableFields(fields) {
  if (
    !Array.isArray(fields) ||
    fields.length === 0 ||
    fields.length > Object.keys(DATA_COLUMNS).length ||
    fields.some((field) => typeof field !== "string" || !Object.hasOwn(DATA_COLUMNS, field)) ||
    new Set(fields).size !== fields.length
  ) {
    return null;
  }

  return ["number", ...fields.filter((field) => field !== "number")];
}

export async function readPeriodicTableRange(database, fields, from, to) {
  const normalizedFields = normalizePeriodicTableFields(fields);
  if (!normalizedFields) throw new TypeError("Unsupported periodic table fields");

  const columns = normalizedFields
    .map((field) => `${DATA_COLUMNS[field]} AS "${field}"`)
    .join(", ");
  const joins = [];
  if (normalizedFields.some((field) => ELEMENT_COLUMNS.has(field))) {
    joins.push("LEFT JOIN elements AS e ON e.number = pt.number");
  }
  if (normalizedFields.some((field) => PROPERTY_COLUMNS.has(field))) {
    joins.push("LEFT JOIN properties AS p ON p.number = pt.number");
  }

  const sql = `
    SELECT ${columns}
    FROM periodic_table AS pt
    ${joins.join("\n")}
    WHERE pt.number BETWEEN ? AND ?
    ORDER BY pt.number
    LIMIT ?
  `;

  const result = await database
    .prepare(sql)
    .bind(from, to, to - from + 1)
    .all();
  if (!result || !Array.isArray(result.results)) {
    throw new TypeError("D1 returned an invalid query result");
  }

  return { fields: normalizedFields, rows: result.results };
}

function assertTest(condition, message) {
  if (!condition) throw new Error(message);
}

function assertTestEqual(actual, expected, message) {
  assertTest(
    JSON.stringify(actual) === JSON.stringify(expected),
    `${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
  );
}

function createTestDatabase(results = []) {
  const calls = [];
  return {
    calls,
    prepare(sql) {
      return {
        bind(...parameters) {
          calls.push({ sql, parameters });
          return {
            async all() {
              return { results };
            },
          };
        },
      };
    },
  };
}

const PERIODIC_TABLE_DATA_TESTS = [
  [
    "reads requested UI fields with one indexed D1 query",
    async () => {
      const fields = ["name", "symbol", "category", "group", "period"];
      const rows = [{
        number: 1,
        name: "Hydrogen",
        symbol: "H",
        category: "nonmetal",
        group: 1,
        period: 1,
      }];
      const database = createTestDatabase(rows);
      const result = await readPeriodicTableRange(database, fields, 1, 118);

      assertTestEqual(result, { fields: ["number", ...fields], rows }, "query result");
      assertTestEqual(database.calls.length, 1, "query count");
      assertTestEqual(database.calls[0].parameters, [1, 118, 118], "bound range");
      assertTest(
        /WHERE pt\.number BETWEEN \? AND \?/.test(database.calls[0].sql),
        "query must use the primary-key range",
      );
      assertTest(/e\."group" AS "group"/.test(database.calls[0].sql), "group must be quoted");
      assertTest(!/JOIN properties/.test(database.calls[0].sql), "unused properties must not be joined");
      assertTest(!/\bOFFSET\b/.test(database.calls[0].sql), "query must not use OFFSET");
    },
  ],
  [
    "joins properties only when a property field is requested",
    async () => {
      const database = createTestDatabase([{ number: 1, density: 0.08988 }]);
      const result = await readPeriodicTableRange(database, ["density"], 1, 1);

      assertTestEqual(result.fields, ["number", "density"], "selected fields");
      assertTest(/LEFT JOIN properties/.test(database.calls[0].sql), "properties join is required");
      assertTest(!/LEFT JOIN elements/.test(database.calls[0].sql), "unused elements must not be joined");
      assertTestEqual(database.calls[0].parameters, [1, 1, 1], "single-element range");
    },
  ],
  [
    "rejects unsupported and duplicate fields before querying D1",
    async () => {
      const database = createTestDatabase();

      for (const fields of [
        [],
        ["symbol; DROP TABLE elements"],
        ["symbol", "symbol"],
        [null],
      ]) {
        let rejected = false;
        try {
          await readPeriodicTableRange(database, fields, 1, 5);
        } catch (error) {
          rejected = error instanceof TypeError;
        }
        assertTest(rejected, `fields should be rejected: ${JSON.stringify(fields)}`);
      }

      assertTestEqual(database.calls.length, 0, "invalid input query count");
    },
  ],
  [
    "rejects malformed D1 results",
    async () => {
      const database = {
        prepare() {
          return {
            bind() {
              return { async all() { return {}; } };
            },
          };
        },
      };
      let rejected = false;
      try {
        await readPeriodicTableRange(database, ["name"], 1, 1);
      } catch (error) {
        rejected = error instanceof TypeError;
      }
      assertTest(rejected, "malformed D1 result should be rejected");
    },
  ],
];

export async function runPeriodicTableDataTests() {
  for (const [name, run] of PERIODIC_TABLE_DATA_TESTS) {
    await run();
    console.log(`✔ ${name}`);
  }
  console.log(`\n${PERIODIC_TABLE_DATA_TESTS.length} tests passed`);
}
