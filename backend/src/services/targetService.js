import { Op } from "sequelize";
import { Target } from "../models/index.js";
import { getFiscalYear } from "../utils/dateUtils.js";

function normalizeFY(fy) {
  if (!fy) return getFiscalYear(new Date());
  return String(fy).replace(/^FY\s*/i, "").trim();
}

export async function getTargets({ fiscalYear = null } = {}) {
  const fy = normalizeFY(fiscalYear);
  let targets = await Target.findAll({
    where: {
      [Op.or]: [
        { fiscalYear: fy },
        { fiscalYear: `FY ${fy}` },
      ],
    },
    order: [["quarter", "ASC"]],
  });

  // If no targets exist for requested FY, initialize them cleanly with 0
  if (targets.length === 0) {
    const quarters = ["Q1", "Q2", "Q3", "Q4"];
    for (const q of quarters) {
      await Target.findOrCreate({
        where: { fiscalYear: fy, quarter: q },
        defaults: {
          fiscalYear: fy,
          quarter: q,
          targetAmount: 0.0,
          notes: `${q} Target for ${fy}`,
        },
      });
    }
    targets = await Target.findAll({
      where: { fiscalYear: fy },
      order: [["quarter", "ASC"]],
    });
  }

  // Deduplicate if both "FY 2026-27" and "2026-27" existed
  const quarterMap = new Map();
  for (const t of targets) {
    const existing = quarterMap.get(t.quarter);
    if (!existing || (!existing.fiscalYear.startsWith("FY") && t.fiscalYear.startsWith("FY"))) {
      quarterMap.set(t.quarter, t);
    }
  }

  return Array.from(quarterMap.values()).map(t => ({
    ...t.toJSON(),
    fiscalYear: fy,
  }));
}

export async function updateTarget({ fiscalYear, quarter, targetAmount, notes }) {
  const fy = normalizeFY(fiscalYear);
  const [target, created] = await Target.findOrCreate({
    where: { fiscalYear: fy, quarter },
    defaults: {
      fiscalYear: fy,
      quarter,
      targetAmount: Number(targetAmount || 0),
      notes: notes || "",
    },
  });

  if (!created) {
    await target.update({
      targetAmount: Number(targetAmount !== undefined ? targetAmount : target.targetAmount),
      notes: notes !== undefined ? notes : target.notes,
    });
  }

  // Remove any obsolete legacy duplicate with "FY " prefix
  await Target.destroy({
    where: {
      fiscalYear: `FY ${fy}`,
      quarter,
    },
  }).catch(() => {});

  return target;
}

export async function bulkUpdateTargets(targetsList = []) {
  const updated = [];
  for (const item of targetsList) {
    if (item.quarter) {
      const t = await updateTarget(item);
      updated.push(t);
    }
  }
  return updated;
}

