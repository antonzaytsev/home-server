require 'json'
require 'fileutils'

class JsonStore
  def initialize(file_path = 'db/services.json')
    @file_path = file_path
    @lock = Mutex.new
    ensure_file_exists
  end

  def all_services
    @lock.synchronize do
      data = read_data
      data['services'] || []
    end
  end

  def find_service(id)
    @lock.synchronize do
      data = read_data
      services = data['services'] || []
      services.find { |service| service['id'] == id }
    end
  end

  def create_service(service_data)
    @lock.synchronize do
      data = read_data
      data['services'] ||= []
      
      # Generate new ID
      max_id = data['services'].map { |s| s['id'] }.max || 0
      new_id = max_id + 1
      
      # Get next display order
      max_order = data['services'].map { |s| s['display_order'] }.max || 0
      
      new_service = {
        'id' => new_id,
        'name' => service_data['name'],
        'url' => service_data['url'],
        'health_check_url' => service_data['health_check_url'],
        'address' => service_data['address'],  # Keep for backward compatibility
        'port' => service_data['port'],        # Keep for backward compatibility
        'display_order' => max_order + 1,
        'status' => 'unknown',
        'last_checked' => Time.now.strftime('%Y-%m-%d %H:%M:%S'),
        'created_at' => Time.now.strftime('%Y-%m-%d %H:%M:%S'),
        'updated_at' => Time.now.strftime('%Y-%m-%d %H:%M:%S')
      }
      
      data['services'] << new_service
      write_data(data)
      new_id
    end
  end

  def update_service(id, service_data)
    @lock.synchronize do
      data = read_data
      services = data['services'] || []
      service = services.find { |s| s['id'] == id }
      
      if service
        service['name'] = service_data['name'] if service_data['name']
        service['url'] = service_data['url'] if service_data['url']
        service['health_check_url'] = service_data['health_check_url'] if service_data.key?('health_check_url')
        service['address'] = service_data['address'] if service_data['address']  # Keep for backward compatibility
        service['port'] = service_data['port'] if service_data.key?('port')      # Keep for backward compatibility
        service['updated_at'] = Time.now.strftime('%Y-%m-%d %H:%M:%S')
        write_data(data)
        true
      else
        false
      end
    end
  end

  def delete_service(id)
    @lock.synchronize do
      data = read_data
      services = data['services'] || []
      original_count = services.length
      data['services'] = services.reject { |s| s['id'] == id }
      write_data(data)
      data['services'].length < original_count
    end
  end

  def update_service_health(id, status)
    @lock.synchronize do
      data = read_data
      services = data['services'] || []
      service = services.find { |s| s['id'] == id }
      
      if service
        service['status'] = status
        service['last_checked'] = Time.now.strftime('%Y-%m-%d %H:%M:%S')
        write_data(data)
        true
      else
        false
      end
    end
  end

  def reorder_services(service_orders)
    @lock.synchronize do
      data = read_data
      services = data['services'] || []
      
      service_orders.each do |order_data|
        service = services.find { |s| s['id'] == order_data['id'] }
        if service
          service['display_order'] = order_data['display_order']
          service['updated_at'] = Time.now.strftime('%Y-%m-%d %H:%M:%S')
        end
      end
      
      write_data(data)
    end
  end

  private

  def ensure_file_exists
    FileUtils.mkdir_p(File.dirname(@file_path))
    unless File.exist?(@file_path)
      write_data({ 'services' => [] })
    end
  end

  def read_data
    return { 'services' => [] } unless File.exist?(@file_path)
    
    content = File.read(@file_path)
    return { 'services' => [] } if content.empty?
    
    JSON.parse(content)
  rescue JSON::ParserError
    puts "Warning: Invalid JSON in #{@file_path}, reinitializing..."
    { 'services' => [] }
  end

  def write_data(data)
    File.write(@file_path, JSON.pretty_generate(data))
  end
end
