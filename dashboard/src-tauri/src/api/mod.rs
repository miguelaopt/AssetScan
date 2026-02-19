use axum::{
    extract::{State, Query},
    routing::{get, post},
    Json, Router,
    http::StatusCode,
};
use serde::{Deserialize, Serialize};

use crate::database::{self, DbPool};
use crate::models::{Machine, MachineFilters};

// Estruturas auxiliares para paginação
#[derive(Deserialize)]
pub struct ListParams {
    pub page: Option<u32>,
    pub limit: Option<u32>,
    pub filter: Option<MachineFilters>,
}

#[derive(Serialize)]
pub struct Pagination {
    pub page: u32,
    pub limit: u32,
    pub total: usize,
    pub pages: i64,
}

#[derive(Serialize)]
pub struct PaginatedResponse<T> {
    pub data: Vec<T>,
    pub pagination: Pagination,
}

// -------------------------------------------------
// Endpoints API v3.0
// -------------------------------------------------

pub async fn list_machines(
    Query(params): Query<ListParams>,
    State(pool): State<DbPool>,
) -> Result<Json<PaginatedResponse<Machine>>, StatusCode> {
    let page = params.page.unwrap_or(1);
    let limit = params.limit.unwrap_or(50).min(100);
    let _offset = (page - 1) * limit;
    
    // Simplificado: usamos o list_machines_filtered que criámos no database.rs
    let filter = params.filter.unwrap_or(MachineFilters {
        os: None, status: None, tags: None, min_ram: None, max_ram: None, search_term: None,
    });

    match database::list_machines_filtered(&pool, filter) {
        Ok(machines) => {
            let total = machines.len(); // Em produção faremos COUNT() via DB
            Ok(Json(PaginatedResponse {
                data: machines,
                pagination: Pagination {
                    page,
                    limit,
                    total,
                    pages: (total as f64 / limit as f64).ceil() as i64,
                },
            }))
        }
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

// Constrói o Router completo da API v3.0
pub fn create_api_router() -> Router<DbPool> {
    Router::new()
        // Define o endpoint RESTful para as máquinas
        .route("/api/v3/machines", get(list_machines))
        // Podes depois adicionar aqui .post, .patch, .delete, etc.
}