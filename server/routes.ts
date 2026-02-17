import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { startBot } from "./bot";
import { api } from "@shared/routes";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Start the Discord Bot
  startBot();

  // API Route: Get Verification Code
  app.get(api.getCode.path, (req, res) => {
    try {
      const codeData = storage.generateCode();
      const now = Date.now();
      
      res.json({
        code: codeData.code,
        expiresIn: Math.floor((codeData.expiresAt - now) / 1000),
        expiresAt: codeData.expiresAt
      });
    } catch (error) {
      console.error("Error generating code:", error);
      res.status(503).json({ message: "Service unavailable" });
    }
  });

  return httpServer;
}
