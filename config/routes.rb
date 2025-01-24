Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  root "challenges#welcome"

  get "space-game" => "challenges#space_game"

  resources :blogs

  get :map, to: "maps#show"
  resources :coord_points

  resources :lists do
    post :items, to: "lists#add_item"
    delete :items, to: "lists#remove_item"
    put :items, to: "lists#order_items"
    resources :list_items, only: [:create, :update, :destroy]
  end
end
