require 'sinatra'
require 'rubygems'
require 'hmac-sha2'

get '/dropbox' do
  erb :dropbox
end

get '/' do
  erb :index
end

def parse_url(url)
  if (url['youtube.com'])
    :yt
  elsif (url['soundcloud.com'])
    :sc
  else
    :other_video
  end  
end

get '/play' do
  if !params[:url] || !params[:session_id]
    return [404, '404: Invalid url']
  end

  case parse_url(params[:url])
  when :sc
    erb :soundcloud, :locals => {
      :url => params[:url],
      :session_id => params[:session_id]
    }
  when :yt
    erb :youtube, :locals => {
      :video_id => params[:url].split('=', 2)[1],
      :session_id => params[:session_id]
    }
  when :other_video
    erb :other_video, :locals => {
      :url => params[:url],
      :session_id => params[:session_id]
    }
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
