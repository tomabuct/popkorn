require 'cgi'
require 'digest/md5'
require 'mongoid'
require 'sinatra'
require 'rubygems'
require 'hmac-sha2'
require 'json'

Mongoid.load!('mongoid.yml')

class Link
  include Mongoid::Document

  field :shortened, type: String
  field :session_id, type: Integer
  field :url, type: String
end

gallery_hash = {}

get '/chooser' do
  erb :chooser
end

get '/gallery' do
  @id = params[:id]
  @urls = JSON.parse(gallery_hash[params[:id]])
  erb :gallery
end

post '/gallery' do
  key = (0...8).map{65.+(rand(26)).chr}.join
  gallery_hash[key] = params[:imgs]
  key
end

get '/' do
  erb :index
end

get '/play' do
  if !params[:url] || !params[:session_id]
    return [404, '404: Invalid url']
  end

  # shortener
  url = CGI.unescape(params[:url])
  session_id = params[:session_id]
  # shortening this is kinda risky, but I'm a daredevil -Don
  short = Digest::MD5.hexdigest(url+session_id)[0..8]
  link = Link.new(:shortened => short, :session_id => session_id, :url => url)
  link.save()

  case url
  when /youtube\.com/
    erb :youtube, :locals => {
      :video_id => url.split('=', 2)[1],
      :session_id => session_id,
      :short_url => short
    }
  when /.*\.(mp4|mov)/
    erb :other_video, :locals => {
      :url => url,
      :session_id => session_id,
      :short_url => short
    }
  #when /soundcloud\.com/
  #  erb :soundcloud, :locals => {
  #    :url => url,
  #    :session_id => session_id,
  #    :short_url => short
  #  }
  else
    [404, '404: Invalid link']
  end
end

get %r{/(?<shortened>[\da-zA-Z]+)} do
  # look it up
  shortened = params['captures'][0]
  link = Link.where('shortened' => shortened)[0]
  final_url = "/play?url="+CGI.escape(link.url)+"&session_id="+link.session_id.to_s
  erb :shortcut, :locals => { :url => final_url }
end

post '/pusher/auth' do
  key = '86baf974dd9fd950a9c8'
  secret = 'e3fcaaf58db221657bf4'
  string_to_sign = "#{params[:socket_id]}:#{params[:channel_name]}"

  signature = HMAC::SHA256.hexdigest(secret, string_to_sign)
  "{\"auth\":\"#{key}:#{signature}\"}"
end
