require 'cgi'
require 'sinatra'
require 'rubygems'
require 'hmac-sha2'
require 'json'

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
  url = CGI.unescape(params[:url])
  case url
  when /soundcloud\.com/
    erb :soundcloud, :locals => {
      :url => url,
      :session_id => params[:session_id]
    }
  when /youtube\.com/
    erb :youtube, :locals => {
      :video_id => url.split('=', 2)[1],
      :session_id => params[:session_id]
    }
  when /.*\.mp4/
    erb :other_video, :locals => {
      :url => url,
      :session_id => params[:session_id]
    }
  else
    return [404, '404: Invalid link']
  end
end

# TODO(donaldh) for shortener if we get to it
#get %r{/(?<shortened>.*/?)} do
#  params['captures'][0]
#end

post '/pusher/auth' do
  key = '86baf974dd9fd950a9c8'
  secret = 'e3fcaaf58db221657bf4'
  string_to_sign = "#{params[:socket_id]}:#{params[:channel_name]}"

  signature = HMAC::SHA256.hexdigest(secret, string_to_sign)
  "{\"auth\":\"#{key}:#{signature}\"}"
end
