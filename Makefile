# =============================================================================
# acd-ctf-system — Next.js + Supabase commands
# =============================================================================

.DEFAULT_GOAL := help

NPM_DIR ?= .
FRONTEND_HOST_PORT ?= 3000

# ANSI colors. Set NO_COLOR=1 to disable them.
ifeq ($(NO_COLOR),1)
COLOR_RESET :=
COLOR_CYAN :=
COLOR_GREEN :=
COLOR_YELLOW :=
COLOR_MAGENTA :=
COLOR_DIM :=
else
COLOR_RESET := \033[0m
COLOR_CYAN := \033[36m
COLOR_GREEN := \033[32m
COLOR_YELLOW := \033[33m
COLOR_MAGENTA := \033[35m
COLOR_DIM := \033[2m
endif

.PHONY: help format format-check lint typecheck test check build dev stop test-e2e \
	db-start db-stop db-reset db-test db-types

# =============================================================================
# Development
# =============================================================================

build: ## Build the frontend for production
	npm --prefix $(NPM_DIR) run build

dev: db-start ## Start the development server and local Supabase
	npm --prefix $(NPM_DIR) run dev

stop: db-stop ## Stop the development server and local Supabase
	-lsof -ti:$(FRONTEND_HOST_PORT) | xargs -r kill
	docker compose down

test-e2e: ## Run Playwright end-to-end tests
	npm --prefix $(NPM_DIR) run test:e2e --if-present

# =============================================================================
# Formatting and quality
# =============================================================================

format: ## Format source files with Prettier
	@printf "$(COLOR_GREEN)Formatting source files...$(COLOR_RESET)\n"
	npm --prefix $(NPM_DIR) run format

format-check: ## Check formatting without changing files
	npm --prefix $(NPM_DIR) run format:check

lint: ## Run ESLint
	npm --prefix $(NPM_DIR) run lint

typecheck: ## Run the TypeScript type checker
	npm --prefix $(NPM_DIR) run typecheck

test: ## Run Vitest unit tests
	npm --prefix $(NPM_DIR) run test --if-present

check: ## Run formatting, lint, type, and unit test checks
	@printf "\n$(COLOR_CYAN)==== FORMATTING ====$(COLOR_RESET)\n"
	npm --prefix $(NPM_DIR) run format:check
	@printf "\n$(COLOR_YELLOW)==== LINTING ====$(COLOR_RESET)\n"
	npm --prefix $(NPM_DIR) run lint
	@printf "\n$(COLOR_MAGENTA)==== TYPE CHECK ====$(COLOR_RESET)\n"
	npm --prefix $(NPM_DIR) run typecheck
	@printf "\n$(COLOR_CYAN)==== UNIT TESTS ====$(COLOR_RESET)\n"
	npm --prefix $(NPM_DIR) run test --if-present
	@printf "\n$(COLOR_GREEN)==== ALL CHECKS PASSED ====$(COLOR_RESET)\n\n"

# =============================================================================
# Database and Supabase
# =============================================================================

db-start: ## Start the local Supabase stack
	npm --prefix $(NPM_DIR) run supabase:start

db-stop: ## Stop the local Supabase stack
	npm --prefix $(NPM_DIR) run supabase:stop

db-reset: ## Reset the local database and apply migrations
	npm --prefix $(NPM_DIR) run supabase:reset

db-test: ## Run local database and RLS tests
	npm --prefix $(NPM_DIR) run supabase:test

db-types: ## Regenerate TypeScript types from the Supabase schema
	npm --prefix $(NPM_DIR) run supabase:types

# =============================================================================
# Help
# =============================================================================

help: ## Show available commands
	@printf "$(COLOR_CYAN)acd-ctf-system commands$(COLOR_RESET)\n\n"
	@printf "$(COLOR_GREEN)==== DEVELOPMENT ====$(COLOR_RESET)\n"
	@printf "  $(COLOR_CYAN)%-14s$(COLOR_RESET) %s\n" "build" "Build the frontend for production"
	@printf "  $(COLOR_CYAN)%-14s$(COLOR_RESET) %s\n" "dev" "Start the development server and local Supabase"
	@printf "  $(COLOR_CYAN)%-14s$(COLOR_RESET) %s\n" "stop" "Stop the development server and local Supabase"
	@printf "  $(COLOR_CYAN)%-14s$(COLOR_RESET) %s\n" "test-e2e" "Run Playwright end-to-end tests"
	@printf "\n$(COLOR_YELLOW)==== FORMATTING AND QUALITY ====$(COLOR_RESET)\n"
	@printf "  $(COLOR_CYAN)%-14s$(COLOR_RESET) %s\n" "format" "Format source files with Prettier"
	@printf "  $(COLOR_CYAN)%-14s$(COLOR_RESET) %s\n" "format-check" "Check formatting without changing files"
	@printf "  $(COLOR_CYAN)%-14s$(COLOR_RESET) %s\n" "lint" "Run ESLint"
	@printf "  $(COLOR_CYAN)%-14s$(COLOR_RESET) %s\n" "typecheck" "Run the TypeScript type checker"
	@printf "  $(COLOR_CYAN)%-14s$(COLOR_RESET) %s\n" "test" "Run Vitest unit tests"
	@printf "  $(COLOR_CYAN)%-14s$(COLOR_RESET) %s\n" "check" "Run formatting, lint, type, and unit test checks"
	@printf "\n$(COLOR_MAGENTA)==== DATABASE AND SUPABASE ====$(COLOR_RESET)\n"
	@printf "  $(COLOR_CYAN)%-14s$(COLOR_RESET) %s\n" "db-start" "Start the local Supabase stack"
	@printf "  $(COLOR_CYAN)%-14s$(COLOR_RESET) %s\n" "db-stop" "Stop the local Supabase stack"
	@printf "  $(COLOR_CYAN)%-14s$(COLOR_RESET) %s\n" "db-reset" "Reset the local database and apply migrations"
	@printf "  $(COLOR_CYAN)%-14s$(COLOR_RESET) %s\n" "db-test" "Run local database and RLS tests"
	@printf "  $(COLOR_CYAN)%-14s$(COLOR_RESET) %s\n" "db-types" "Regenerate TypeScript types from the Supabase schema"
	@printf "\n$(COLOR_DIM)Use NO_COLOR=1 to disable command colors.$(COLOR_RESET)\n"
