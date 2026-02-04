import type { NextFunction, Request, Response } from "express";
import fs from "node:fs/promises";
import path from "node:path";

const auditLogDir = path.join(process.cwd(), "logs");
const auditLogPath = path.join(auditLogDir, "audit.log");

async function appendAuditLog(entry: Record<string, unknown>) {
    await fs.mkdir(auditLogDir, { recursive: true });
    await fs.appendFile(auditLogPath, `${JSON.stringify(entry)}\n`, "utf8");
}

export function auditAdminRequests(req: Request, res: Response, next: NextFunction) {
    const startedAt = Date.now();

    res.on("finish", () => {
        const durationMs = Date.now() - startedAt;
        const entry = {
            ts: new Date().toISOString(),
            scope: "admin",
            user_id: (req as any)?.user?.id ?? null,
            role: (req as any)?.user?.role ?? null,
            method: req.method,
            path: req.originalUrl,
            status: res.statusCode,
            duration_ms: durationMs,
            ip: req.ip
        };

        appendAuditLog(entry).catch(() => {
            // Best effort: never block requests if logging fails.
        });
    });

    next();
}

