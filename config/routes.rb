Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  root "challenges#welcome"

  get "space-game" => "challenges#space_game"

  resources :blogs

  resources :lists do
    put :items, to: "lists#order_items"
    resources :list_items, only: [:create, :update, :destroy]
  end
end
