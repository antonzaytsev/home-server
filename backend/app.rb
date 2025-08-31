require 'sinatra'
require 'json'
require 'net/http'
require 'uri'
require 'timeout'
require_relative 'lib/json_store'

set :bind, '0.0.0.0'
set :port, 4568

# CORS configuration
before do
  headers['Access-Control-Allow-Origin'] = '*'
  headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
  headers['Access-Control-Allow-Headers'] = 'Content-Type'
end

options '*' do
  200
end

# Database connection
def store
  @store ||= JsonStore.new('db/services.json')
end

# Initialize database with sample data if empty
def initialize_database
  if store.all_services.empty?
    puts "Initializing database with sample data..."

    sample_services = [
      { 'name' => 'Home Assistant', 'address' => '192.168.0.30', 'port' => 8123 },
      { 'name' => 'Plex Server', 'address' => '192.168.0.30', 'port' => 32400 },
      { 'name' => 'Router Admin', 'address' => '192.168.0.1', 'port' => 80 }
    ]

    sample_services.each { |service_data| store.create_service(service_data) }
    puts "Created #{sample_services.length} sample services"
  end
end

# Health check method
def check_service_health(address, port)
  begin
    Timeout::timeout(5) do
      uri = URI("http://#{address}:#{port}")
      response = Net::HTTP.get_response(uri)
      return response.code.to_i < 400 ? 'healthy' : 'unhealthy'
    end
  rescue => e
    puts "Health check failed for #{address}:#{port} - #{e.message}"
    return 'unhealthy'
  end
end

# Update service health status
def update_service_health(service_id, status)
  store.update_service_health(service_id, status)
end

# Initialize database on startup
initialize_database

# Background health check thread
Thread.new do
  loop do
    begin
      services = store.all_services

      services.each do |service|
        id = service['id']
        address = service['address']
        port = service['port'] || 80
        status = check_service_health(address, port)
        update_service_health(id, status)
        puts "Health check for #{address}:#{port} - #{status}"
      end
    rescue => e
      puts "Error in health check thread: #{e.message}"
    end

    sleep 60 # Check every minute
  end
end

# API Routes

# GET /api/services - List all services
get '/api/services' do
  content_type :json
  services = store.all_services.sort_by { |service| service['display_order'] || 0 }
  services.to_json
end

# POST /api/services - Create new service
post '/api/services' do
  content_type :json
  data = JSON.parse(request.body.read)

  service_id = store.create_service(data)

  # Check health immediately for new service
  status = check_service_health(data['address'], data['port'] || 80)
  update_service_health(service_id, status)

  status 201
  { id: service_id, message: 'Service created successfully' }.to_json
end

# PUT /api/services/:id - Update service
put '/api/services/:id' do
  content_type :json
  data = JSON.parse(request.body.read)

  if store.update_service(params[:id].to_i, data)
    # Check health immediately after update
    status = check_service_health(data['address'], data['port'] || 80)
    update_service_health(params[:id].to_i, status)

    { message: 'Service updated successfully' }.to_json
  else
    status 404
    { error: 'Service not found' }.to_json
  end
end

# DELETE /api/services/:id - Delete service
delete '/api/services/:id' do
  content_type :json

  if store.delete_service(params[:id].to_i)
    { message: 'Service deleted successfully' }.to_json
  else
    status 404
    { error: 'Service not found' }.to_json
  end
end

# PUT /api/services/reorder - Reorder services
put '/api/services/reorder' do
  content_type :json
  data = JSON.parse(request.body.read)
  service_orders = data['services'] # Array of {id, display_order}

  store.reorder_services(service_orders)

  { message: 'Services reordered successfully' }.to_json
end

# GET /api/services/:id/health - Manual health check
get '/api/services/:id/health' do
  content_type :json

  service = store.find_service(params[:id].to_i)

  if service
    address = service['address']
    port = service['port'] || 80
    status = check_service_health(address, port)
    update_service_health(params[:id].to_i, status)
    { status: status }.to_json
  else
    status 404
    { error: 'Service not found' }.to_json
  end
end

# Health check endpoint for the app itself
get '/api/health' do
  content_type :json
  { status: 'healthy', timestamp: Time.now.to_s }.to_json
end

# API info endpoint
get '/api' do
  content_type :json
  {
    message: 'Home Server Gallery API',
    version: '1.0.0',
    endpoints: [
      'GET /api/services - List all services',
      'POST /api/services - Create new service',
      'PUT /api/services/:id - Update service',
      'DELETE /api/services/:id - Delete service',
      'PUT /api/services/reorder - Reorder services',
      'GET /api/services/:id/health - Manual health check'
    ]
  }.to_json
end
