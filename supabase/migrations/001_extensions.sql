-- ============================================================
-- Migration 001: Extensiones necesarias
-- ============================================================
-- Objetivo: Habilitar extensiones de PostgreSQL requeridas
-- Dependencias: Ninguna
-- Idempotente: SI (CREATE EXTENSION IF NOT EXISTS)
-- Elimina datos existentes: NO
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;
